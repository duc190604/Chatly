import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Message, MessageDocument, MessageStatus } from "./schemas/message.schema";
import { Connection, isValidObjectId, Model, Types } from "mongoose";
import { ChatService } from "../chat/chat.service";
import { Chat, ChatDocument } from "../chat/schemas/chat.schema";
import { UserService } from "../user/user.service";

@Injectable()
export class MessageService {
  constructor( @InjectModel(Message.name) private messageModel :Model<MessageDocument>,
               @InjectModel(Chat.name) private chatModel :Model<ChatDocument>,
               @Inject(forwardRef(()=>ChatService)) private chatService:ChatService,
               private userSerivce: UserService,
               @InjectConnection() private connection:Connection) {}
  async findById(messsageId:string) {
    const message = this.messageModel.findById(messsageId).lean({ virtuals: true });
    if (!message) return null;
    return message;
  }
  async getMessage(userId: string, chatId: string, lastMessageId: string, limit: number, type?: string, getRevoked: boolean = true) {
    const user = await this.userSerivce.findById(userId);
    if (!user) throw new NotFoundException('Sender not found');
    const query: any = {
      chat: new Types.ObjectId(chatId),
    };

    if (type) {
      query.type = type;
    }
    if (lastMessageId) {
      if (!isValidObjectId(lastMessageId))
        throw new NotFoundException('Invalid message id');
      query._id = { $lt: new Types.ObjectId(lastMessageId) };
    }
    const andConditions: any[] = [];

    andConditions.push({
      $or: [
        { usersDeleted: { $nin: [userId] } },
        { usersDeleted: { $exists: false } },
      ],
    });

    if (!getRevoked) {
      andConditions.push({
        $or: [
          { isRevoked: false },
          { isRevoked: { $exists: false } },
        ],
      });
    }

    // 6. Gộp tất cả điều kiện $and
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // 7. Truy vấn với limit + 1 để xác định hasNextPage
    const realLimit = Number(limit) || 20;
    const messages = await this.messageModel
        .find(query)
        .sort({ _id: -1 })
        .limit(realLimit + 1)
        .populate('sender')
        .lean({ virtuals: true });

    const hasNextPage = messages.length > realLimit;
    const slicedMessages = hasNextPage ? messages.slice(0, realLimit) : messages;
    const nextCursor = hasNextPage
        ? slicedMessages[slicedMessages.length - 1]?._id?.toString()
        : null;

    // 8. Trả kết quả
    return {
      data: slicedMessages,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    };
  }

  async createMessage(senderId:string, chatId:string, content:string, type:string) {
    const sender=await this.userSerivce.findById(senderId);
    if(!sender) throw new NotFoundException("Sender not found");
    const chat= await this.chatService.findById(chatId)
    if(!chat) throw new NotFoundException("Chat not found");
    if(!chat.members.map(id => id.toString()).includes(senderId.toString())) throw new NotFoundException("Sender not found in chat");
    // const session = await this.connection.startSession();
    // try {
    //   session.startTransaction();
    //   const newMess= new this.messageModel({sender:senderId,chat:chatId,content:content,type:type});
    //   await newMess.save({session});
    //   await this.chatModel.updateOne({_id:chatId},{ lastMessage: newMess._id },{session});
    //   await session.commitTransaction();
    //   const mess= newMess.toObject();
    //   return {
    //     ...mess,
    //     sender:sender.toObject(),
    //   }
    // } catch (error) {
    //   await session.abortTransaction(); // Rollback
    //   throw error;
    // } finally {
    //   await session.endSession();
    // }
    const newMess = await this.messageModel.create({
      sender: senderId,
      chat: chatId,
      content,
      type,
    });
    this.chatModel.updateOne(
      { _id: chatId },
      { lastMessage: newMess._id }
    ).catch((err) => {
      console.warn("Không thể cập nhật lastMessage:", err?.message || err);
    });

    return {
      ...newMess.toObject(),
      sender: sender.toObject(),
    };
  }
  async editMessage(senderId:string, messageId:string, content:string) {
    const sender=await this.userSerivce.findById(senderId);
    if(!sender) throw new NotFoundException("Sender not found");
    const message= await this.messageModel.findById(messageId);
    if(!message) throw new NotFoundException("Message not found");
    if(message.type!== "text") throw new NotFoundException("You can't edit this message");
    if(message.sender.toString()!=senderId) throw new NotFoundException("Sender not sent this message")
    message.content=content;
    message.isEdited=true;
    await message.save();
    return message.toObject();
  }
  async revokeMessage(senderId:string, messageId:string) {
    const sender=await this.userSerivce.findById(senderId);
    if(!sender) throw new NotFoundException("Sender not found");
    const message= await this.messageModel.findById(messageId);
    if(!message) throw new NotFoundException("Message not found");
    if(message.sender.toString()!=senderId) throw new NotFoundException("Sender not sent this message")
    message.isRevoked=true;
    message.content="This message is revoked";
    await message.save();
    return {
      message:"Message revoked successfully",
    };
  }
  async deleteMessage(userId:string, messageId:string) {
    const user=await this.userSerivce.findById(userId);
    if(!user) throw new NotFoundException("Sender not found");
    const message= await this.messageModel.findById(messageId);
    if(!message) throw new NotFoundException("Message not found");
    message.usersDeleted.push(userId);
    await message.save();
    return {
      message:"Message deleted successfully",
    };
  }
  async deleteAllMessagesByChat(chatId:string) {
    const chat=await this.chatService.findById(chatId);
    if(!chat) throw new NotFoundException("Chat not found");
    await this.messageModel.deleteMany({chatId:chatId});
    return {message:"Messages deleted successfully"};
  }
  async pinMessage(userId:string, messageId:string) {
    const user=await this.userSerivce.findById(userId);
    if(!user) throw new NotFoundException("Sender not found");
    const message= await this.messageModel.findById(messageId).lean({ virtuals: true });
    if(!message) throw new NotFoundException("Message not found");
    await this.chatService.pinMessage(messageId,message.chat.toString(),userId);
    return {
      message:"Message pinned successfully",
    }
  }
  async unpinMessage(userId:string, messageId:string) {
    const user=await this.userSerivce.findById(userId);
    if(!user) throw new NotFoundException("Sender not found");
    const message= await this.messageModel.findById(messageId).lean({ virtuals: true });
    if(!message) throw new NotFoundException("Message not found");
    await this.chatService.unpinMessage(messageId,message.chat.toString(),userId);
    return {
      message:"Message unpinned successfully",
    }
  }
  async changeStatus(messageId:string, userId:string, status:MessageStatus) {
    const user=await this.userSerivce.findById(userId);
    if(!user) throw new NotFoundException("Sender not found");
    const message= await this.messageModel.findById(messageId);
    if(!message) throw new NotFoundException("Message not found");
    const chat=await this.chatService.findById(message.chat.toString());
    if (!chat || !chat.members.map(id => id.toString()).includes(userId))
      throw new ForbiddenException("You are not a member of this chat");
    message.status=status;
    await message.save();
    return {
      message:"Message status changed successfully",
    }
  }
  async getImages(userId:string, chatId: string, lastMessageId: string, limit: number) {
    // 2. Tạo query cơ bản
    let query: any = {
      chat: new Types.ObjectId(chatId),
      type: "image",
    };

    // 3. Nếu có lastMessageId (cursor), chỉ lấy tin cũ hơn
    if (lastMessageId) {
      if (!isValidObjectId(lastMessageId))
        throw new NotFoundException('Invalid message id');
      query._id = { $lt: new Types.ObjectId(lastMessageId) };
    }

    // 4. Bổ sung điều kiện tin nhắn chưa bị user xóa
    query.$or = [
      { usersDeleted: { $nin: [userId] } },
      { usersDeleted: { $exists: false } },
    ];

    // 5. Truy vấn với limit + 1 để xác định hasNextPage
    const realLimit = Number(limit) || 20;
    const messages = await this.messageModel
      .find(query)
      .sort({ _id: -1 })
      .limit(realLimit + 1)
      .populate('sender')
      .lean({ virtuals: true });

    const hasNextPage = messages.length > realLimit;

    // 6. Cắt bớt tin nếu dư 1 (dùng để xác định hasNextPage)
    const slicedMessages = hasNextPage ? messages.slice(0, realLimit) : messages;

    // 7. Lấy nextCursor nếu còn trang sau
    const nextCursor = hasNextPage
      ? slicedMessages[slicedMessages.length - 1]?._id?.toString()
      : null;
    // const total = await this.messageModel.countDocuments({
    //   chat: new Types.ObjectId(chatId),
    //   $or: query.$or,
    // });

    // 9. Trả về kết quả chuẩn hoá
    return {
      data: slicedMessages,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    };
  }
  async getFiles (userId:string, chatId: string, lastMessageId: string, limit: number) {
    let query: any = {
      chat: new Types.ObjectId(chatId),
      type: "file",
    };
    if (lastMessageId) {
      if (!isValidObjectId(lastMessageId))
        throw new NotFoundException('Invalid message id');
      query._id = { $lt: new Types.ObjectId(lastMessageId) };
    }
   query.$or = [
      { usersDeleted: { $nin: [userId] } },
      { usersDeleted: { $exists: false } },
    ];
    const realLimit = Number(limit) || 20;
    const messages = await this.messageModel
      .find(query)
      .sort({ _id: -1 })
      .limit(realLimit + 1)
      .populate('sender')
      .lean({ virtuals: true });
    const hasNextPage = messages.length > realLimit;
    const slicedMessages = hasNextPage ? messages.slice(0, realLimit) : messages;
    const nextCursor = hasNextPage
      ? slicedMessages[slicedMessages.length - 1]?._id?.toString()
      : null;
    // const total = await this.messageModel.countDocuments({
    //   chat: new Types.ObjectId(chatId),
    //   $or: query.$or,
    // });

    // 9. Trả về kết quả chuẩn hoá
    return {
      data: slicedMessages,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    };
  }
  async findMessages(chatId:string, search:string,userId:string) {
    return this.messageModel
      .find({
        chat: chatId,
        content: { $regex: search, $options: "i" },
        type: "text",
        usersDeleted: { $nin: [userId] },
        isRevoked: false,
      })
      .populate("sender", "-password")
      .lean({ virtuals: true });
  }
  async deleteAllMessage(chatId:string, userId:string) {
    const chat = await this.chatService.findById(chatId);
    if(!chat) throw new NotFoundException("Chat not found")
    const isMember = chat.members.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      throw new NotFoundException("You are not a member of this chat");
    }
    await this.messageModel.updateMany(
      { chat: chatId },
      { $addToSet: { usersDeleted: userId } }
    );
    return {
      message:"Messages deleted successfully",
    }

  }
}