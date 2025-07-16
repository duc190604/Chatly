import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Chat, ChatDocument } from "./schemas/chat.schema";
import { UserService } from "../user/user.service";
import { MessageService } from "../message/message.service";
import { Message, MessageDocument } from "../message/schemas/message.schema";
import { async } from "rxjs";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private userSerivce: UserService,
    @Inject(forwardRef(()=>MessageService))private messageService: MessageService,
   @InjectConnection() private readonly connection: Connection,
  ) {}
  async findById(chatId: string) {
    const chat = await this.chatModel.findById(chatId).lean({ virtuals: true });
    if (!chat) return null;
    return chat;
  }
  async getChatById(chatId:string, userId: string) {
    const user = await this.userSerivce.findById(userId);
    if(!user)
      throw new NotFoundException("User not found")
    const chat= await this.chatModel.findById(chatId).populate(["members","lastMessage"],"-password");
    if(!chat)
      throw new NotFoundException("Chat not found")
    if (!chat.members.some(mem => (mem as any)._id?.equals?.(userId))
    ) {
      throw new ForbiddenException("You are not a member of this chat");
    }
    return chat.toObject();
  }
  async getChatByUserIdAndMemberId(userId: string, memberId: string) {
    const member = await this.userSerivce.findById(memberId);
    if (!member) throw new NotFoundException("User not found");
    const chat = await this.chatModel
      .findOne({
        members: { $all: [userId, memberId] },
        isGroup: false,
      })
      .populate("members", "-password")
      .populate("creator","-password")
      .populate("lastMessage", "-password")
      .lean({ virtuals: true });
    if (!chat) throw new NotFoundException("Chat not found");
    return chat;
  }
  async getInfoChat(chatId:string) {

  }
  async createPrivateChat(creatorId: string, memberId: string) {
    const creator = await this.userSerivce.findById(creatorId);
    const member = await this.userSerivce.findById(memberId);
    if (!creator || !member) throw new NotFoundException("User not found");
    const existChat = await this.chatModel.findOne({
      members: { $all: [creatorId, memberId], $size: 2 },
    })
      .populate(["members", "lastMessage"], "-password")
      .lean({ virtuals: true });
    if(existChat)
      return existChat
    const chat = {
      creator: creatorId,
      members: [creatorId, memberId],
      isGroup: false,
      lastMessage: null,
      pinnedMessage: [],
    };
    const newChat = new this.chatModel(chat);
    await newChat.save();
    const populatedChat = await newChat.populate("members","-password")
    return populatedChat.toObject();
  }
  async getChatByUserId(userId: string) {
    const user = await this.userSerivce.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const chats = await this.chatModel
      .find()
      .where("members")
      .in([userId])
      .populate("creator")
      .populate("members")
      .populate("lastMessage", "-password")
      .lean({ virtuals: true });
    return chats;
  }
  async updateLastedMessage(chatId: string, messageId: string) {
    const chat = await this.chatModel.findOne({ _id: chatId });
    if (!chat) throw new NotFoundException("Chat not found");
    const message = await this.userSerivce.findById(messageId);
    if (!message) throw new NotFoundException("Message not found");
    chat.lastMessage = messageId;
    await chat.save();
    return chat;
  }
  async blockChat(chatId: string, userId: string) {
    const user = await this.userSerivce.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const chat = await this.chatModel.findOne({ _id: chatId });
    if (!chat) throw new NotFoundException("Chat not found");
    if (!chat.members.includes(userId))
      throw new ForbiddenException("You can't block your own chat");
    chat.membersBlocked.push(userId);
    await chat.save();
    return chat;
  }
  async deletePrivateChat(chatId: string, userId: string) {
    const user = await this.userSerivce.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const chat = await this.chatModel.findOne({ _id: chatId });
    if (!chat) throw new NotFoundException("Chat not found");
    if (!chat.members.includes(userId))
      throw new ForbiddenException("You are not a member of this chat");
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.messageModel.deleteMany({ chatId: chatId }).session(session);
      await this.chatModel.deleteOne({ _id: chatId }).session(session);
      await session.commitTransaction();
      return {
        message: "Chat deleted successfully",
      };
    } catch (error) {
      await session.abortTransaction(); // Rollback
      throw error;
    } finally {
      await session.endSession();
    }
  }
  async pinMessage(messageId: string, chatId: string, userId:string) {
    const chat=await this.chatModel.findById(chatId)
    if(!chat) throw new NotFoundException("Chat not found")
    if(!chat.members.includes(userId)) throw new ForbiddenException("You are not a member of this chat")
    chat.pinnedMessages.push(messageId)
    await chat.save()
    return chat.toObject()
  }
  async unpinMessage(messageId: string, chatId: string, userId:string) {
    const chat=await this.chatModel.findById(chatId)
    if(!chat) throw new NotFoundException("Chat not found")
    if(!chat.members.includes(userId)) throw new ForbiddenException("You are not a member of this chat")
    if(!chat.pinnedMessages.includes(messageId)) throw new ForbiddenException("This message is not pinned")
    chat.pinnedMessages.splice(chat.pinnedMessages.indexOf(messageId),1)
    await chat.save()
    return chat.toObject()
  }

}