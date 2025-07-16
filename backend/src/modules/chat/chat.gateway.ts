import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "../user/user.service";
import {
  ForbiddenException,
  NotFoundException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserSocket } from "../../common/customDecorator/user-socket.decorator";
import { UserToken } from "../../common/user-token.type";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AllWsExceptionsFilter } from "../../common/ws-exceptions.filter";
import { SendMessageDto } from "../message/dtos/sendMessage.dto";
import { MessageService } from "../message/message.service";
import { wsSuccess } from "../../common/util/ws-response.util";
import { MessageStatus } from "../message/schemas/message.schema";
import { handleWsException } from "../../common/util/handle-ws-exception.util";
import { validateDataWs } from "../../common/util/validate-data-ws.util";
import { ResponseMessageDto } from "../message/dtos/responseMessage.dto";
import { ParamMessageIdDto } from "../message/dtos/paramMessageId.dto";
import { RedisClientService } from "../redis/redis-client.service";
import { FriendRequestService } from "../friend-request/friend-request.service";
import { EditMessageDto } from "../message/dtos/editMessage.dto";
import { EditMessBySocketDto } from "../message/dtos/editMessBySocket.dto";

@WebSocketGateway({ namespace: "/chat", cors: true })
// @UseGuards(WsJwtGuard)
// @UsePipes(new ValidationPipe())
// @UseFilters(new AllWsExceptionsFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // giúp override lại các hàm để gắn hook vào lifecycle
  @WebSocketServer() server: Server;
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisClientService,
    private readonly friendRequestService: FriendRequestService,
  ) {}
  async handleConnection(client: Socket) {
    //hook khi client connect
    const timeout = setTimeout(async () => {
      if (client.data.user) {
        try {
          await this.redisService.removeOnlineUser(
            client.data.user.userId,
            client.id,
          );
        } catch (error) {
          console.log("error", error);
        }
      }
      client.emit("connect_status", {
        error: { message: "Unauthorized ", type: "Unauthorized", statusCode: 401 },
      });
      client.disconnect();
    }, 60 * 60 * 1000);
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.emit("connect_status", {
          error: { message: "Token not found", type: "Unauthorized", statusCode: 401 },
        });
        clearTimeout(timeout);
        client.disconnect();
        return;
      }
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        });
        client.data.user = { userId: payload.sub, type: payload.type };
      } catch (e) {
        client.emit("connect_status", {
          error: { message: "Unauthorized ", type: "Unauthorized", statusCode: 401 },
        });
        clearTimeout(timeout);
        client.disconnect();
        return;
      }
      await this.typing(client);
      await this.stopTyping(client);
      await this.sendMessage(client);
      await this.editMessage(client);
      await this.revokeMessage(client);
      await this.joinRoom(client);
      await this.leaveRoom(client);
      client.emit("connect_status", { status: "success" });
      const user = client.data.user;
      await this.sendOnlineUser(client, user.userId.toString());
      client.join(user.userId.toString());
    } catch (e) {
      client.emit("connect_status", { error: { message: e.toString()}})
      clearTimeout(timeout);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      try {
        await this.redisService.removeOnlineUser(
          client.data.user.userId,
          client.id,
        );
      } catch (error) {
        console.log("error", error);
      }
    }
  }
  async sendMessage(client: Socket) {

    const user = client.data.user;
    client.on("send_message", async (body: SendMessageDto, ack: Function) => {
      try {
        body = await validateDataWs(SendMessageDto, body);
        const chat = await this.chatService.findById(body.chatId);
        if (!chat) throw new NotFoundException("Chat not found");
        const mess = await this.messageService.createMessage(
          user.userId,
          body.chatId,
          body.content,
          body.type,
        );
        let statusMessage = "sent";
        const resMess = ResponseMessageDto.plainToInstance(mess);
        ack(wsSuccess(resMess));
        //Gửi đến room(userId) để cập nhật list chat
        for (const mem of chat.members) {
          if (mem.toString() === user.userId.toString()) continue;
          this.server
            .to(mem.toString())
            .timeout(5000)
            .emit(
              "new_message",
              {
                data: resMess,
              },
              async (err, res) => {
                try {
                  if (
                    res[0]?.status === "success" &&
                    statusMessage === "sent"
                  ) {
                    client.emit("delivered_message", {
                      data: {
                        messageId: mess._id,
                      },
                    });
                    await this.messageService.changeStatus(
                      mess.id,
                      mem.toString(),
                      MessageStatus.DELIVERED,
                    );
                    statusMessage = "delivered";
                    client.emit("change_status_message", {messageId: mess._id, status: "delivered"})
                  }
                } catch (err) {
                  client.emit("socket_error", {
                    status: "error",
                    error: {
                      message: err.message || "Unknown error",
                      type: err.name || "Error",
                      statusCode: err.status || 500,
                    },
                  });
                  console.error("Lỗi changeStatus:", err);
                }
              },
            );
        }
        //Gửi đên nhóm để cập nhật tin nhắn và seen
        client.broadcast.to(chat._id.toString()).timeout(5000).emit(
          `new_message_${chat._id.toString()}`,
          {
            data: resMess,
          },
          async (err, res: any) => {
            if (res[0]?.status == "success" && statusMessage !== "seen") {
              await this.messageService.changeStatus(
                mess._id.toString(),
                user.userId,
                MessageStatus.SEEN,
              );
              statusMessage = "seen";
              client.emit("change_status_message", {messageId: mess._id, status: "seen"})
            }
          },
        );
      } catch (error) {
        console.log("error", error);
        handleWsException({
          exception: error,
          client: client,
          ack: ack,
        });
      }
    });

  }
  async revokeMessage(client: Socket) {
    const user = client.data.user;
    client.on(
      "revoke_message",
      async (body: ParamMessageIdDto, ack: Function) => {
        try {
          body = await validateDataWs(ParamMessageIdDto, body);
          const res = await this.messageService.revokeMessage(
            user.userId,
            body.messageId,
          );
          if (res) {
            ack(wsSuccess(res));
          }
          const messsage = await this.messageService.findById(body.messageId);
          const chat = await this.chatService.findById(
            messsage!.chat.toString(),
          );
          client.broadcast
            .to(chat!.id.toString())
            .emit(`message_revoked_${chat!.id}`, {
              messageId: body.messageId,
            }); //có thể thêm ack để lưu những người nhận thất bại để gửi lại
          if (chat!.lastMessage.toString() === body.messageId) {
            for (const mem of chat!.members) {
              if (mem.toString() === user.userId.toString()) continue;
              this.server.to(mem.toString()).emit("message_revoked", {
                messageId: body.messageId,
                chatId: chat!.id,
              });
            }
          }
        } catch (error) {
          console.log("error", error);
          handleWsException({
            exception: error,
            client: client,
            ack: ack,
          });
        }
      },
    );
  }
  async editMessage(client: Socket) {
    const user = client.data.user;
    client.on(
      "edit_message",
      async (body: EditMessBySocketDto, ack: Function) => {
        try {
          body = await validateDataWs(EditMessBySocketDto, body);
          const result = await this.messageService.editMessage(
            user.userId,
            body.messageId,
            body.newContent,
          );
          const res= ResponseMessageDto.plainToInstance(result);
          if (res) {
            ack(wsSuccess(res));
          }
          const messsage = await this.messageService.findById(body.messageId);
          const chat = await this.chatService.findById(
            messsage!.chat.toString(),
          );
          client.broadcast
            .to(res.chat.toString())
            .emit(`message_edited_${res.chat.toString()}`, {
              messageId: body.messageId,
              newContent: body.newContent,
            }); //có thể thêm ack để lưu những người nhận thất bại để gửi lại
        } catch (error) {
          console.log("error", error);
          handleWsException({
            exception: error,
            client: client,
            ack: ack,
          });
        }
      },
    );
  }
  async sendOnlineUser(client: Socket, newUserId: string) {
    try {
      const usersOnline = await this.redisService.getAllOnlineUsers();
      let isSend = false;
      if (!usersOnline.includes(newUserId)) {
        isSend = true;
        await this.redisService.addOnlineUser(
          client.data.user.userId,
          client.id,
        );
      }
      const friend =
        await this.friendRequestService.getFriendByUserId(newUserId);
      const listUserOnline: string[] = [];
      if (!friend) return;
      for (const user of friend) {
        if (usersOnline.includes(user.id.toString())) {
          listUserOnline.push(user.id.toString());
          //gửi đến các bạn là tôi đã online
          if (isSend) {
            this.server.to(user.id.toString()).emit("new_online_user", {
              userId: newUserId,
            });
          }
        }
      }
      //gửi đến user mới online các bạn đang online
      this.server.to(client.id).emit("online_user", {
        data: listUserOnline,
      });
    } catch (error) {
      console.log("error", error);
    }
  }
  async typing(client: Socket) {
    client.on("typing", async (body: { chatId: string }) => {
      try {
        const chat = await this.chatService.findById(body.chatId);
        if (!chat) throw new NotFoundException("chat not found");
        if (
          !chat.members
            .map((id) => id.toString())
            .includes(client.data.user.userId)
        ) {
          throw new ForbiddenException("You are not in this chat");
        }
        console.log("typing", body);
        client.broadcast
          .to(body.chatId)
          .emit(`typing_${body.chatId}`, {
            chatId: body.chatId,
            userId: client.data.user.userId,
          });
      } catch (error) {
        console.log("error", error);
        handleWsException({
          exception: error,
          client: client,
        });
      }
    });
  }
  async stopTyping(client: Socket) {
    client.on("stop_typing", async (body: { chatId: string }) => {
      try {
        const chat = await this.chatService.findById(body.chatId);
        if (!chat) throw new NotFoundException("chat not found");
        if (
          !chat.members
            .map((id) => id.toString())
            .includes(client.data.user.userId)
        ) {
          throw new ForbiddenException("You are not in this chat");
        }
        client.broadcast.to(body.chatId).emit(`stop_typing_${body.chatId}`, {
          chatId: body.chatId,
          userId: client.data.user.userId,
        });
      } catch (error) {
        console.log("error", error);
        handleWsException({
          exception: error,
          client: client,
        });
      }
    });
  }
  async joinRoom(client: Socket) {
    client.on("join_room", async (body: { chatId: string }, ack:Function) => {
      try
      {
        const chat = await this.chatService.findById(body.chatId);
        if(!chat) throw new NotFoundException("Chat not found");
        if(!chat.members.map((id)=>id.toString()).includes(client.data.user.userId))
          throw new ForbiddenException("You are not in this chat");
        client.join(body.chatId);
        ack(wsSuccess({message:"join room success"}));
      }
      catch (error)
      {
        handleWsException({
          exception: error,
          client: client,
          ack:ack,
        });
      }
    })
  }
  async leaveRoom(client: Socket) {
    client.on("leave_room", async (body: { chatId: string }) => {
      try
      {
        const chat = await this.chatService.findById(body.chatId);
        client.leave(body.chatId);
      }
      catch (error)
      {
        console.log("error", error);
        handleWsException({
          exception: error,
          client: client,
        });
      }
    })

  }
  // @SubscribeMessage("send_message")
  // async sendMessage(
  //
  //   @ConnectedSocket() client: Socket,
  //
  //   @MessageBody() body: SendMessageDto,
  //   @UserSocket() user: UserToken,
  //
  // ) {
  //   // console.log("body", body);
  //   // console.log("client", client.handshake);
  //   // console.log("args", args[0]);
  //   // console.log("user", ack);
  //   const  ack:any = function(){};
  //
  //   try {
  //     const chat = await this.chatService.findById(body.chatId);
  //     if (!chat) throw new NotFoundException("Chat not found");
  //     const mess = await this.messageService.createMessage(
  //       user.userId,
  //       body.chatId,
  //       body.content,
  //       body.type,
  //     );
  //     let statusMessage = "sent";
  //
  //     // ack(wsSuccess(mess));
  //     for (const mem of chat.members) {
  //       this.server.to(mem.toString()).emit(
  //         `new_message`,
  //         {
  //           data: mess,
  //         },
  //         async (res: any) => {
  //           try {
  //             if (res?.status === "success" && statusMessage === "sent") {
  //               client.emit("delivered_message", {
  //                 data: {
  //                   messageId: mess._id,
  //                 },
  //               });
  //               await this.messageService.changeStatus(
  //                 mess.id,
  //                 mem.toString(),
  //                 MessageStatus.DELIVERED,
  //               );
  //               statusMessage = "delivered";
  //             }
  //           } catch (err) {
  //             client.emit("socket_error", {
  //               status: "error",
  //               error: {
  //                 message: err.message || "Unknown error",
  //                 type: err.name || "Error",
  //                 statusCode: err.status || 500,
  //               },
  //             });
  //             console.error("Lỗi changeStatus:", err);
  //           }
  //         },
  //       );
  //     }
  //     this.server.to(chat._id.toString()).emit(
  //       `new_message_${chat._id}`,
  //       {
  //         data: mess,
  //       },
  //       async (res: any) => {
  //         if (res?.status == "success") {
  //           await this.messageService.changeStatus(
  //             mess._id.toString(),
  //             user.userId,
  //             MessageStatus.SEEN,
  //           );
  //           statusMessage = "seen";
  //         }
  //       },
  //     );
  //   }catch (error){
  //     console.log("error",error)
  //    handleWsException({
  //      exception:error,
  //      client:client,
  //      ack:ack,
  //    })
  //   }
  // }
}