import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  FriendRequest,
  FriendRequestDocument,
  FriendRequestSchema,
} from "./schemas/friend-request.schema";
import { Model } from "mongoose";
import { UserService } from "../user/user.service";
import { User, UserDocument } from "../user/schemas/user.schema";
import { ChatService } from "../chat/chat.service";

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequestDocument>,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  async getRequest(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const request = await this.friendRequestModel
      .find({
        $or: [{ recipient: userId }, { sender: userId }],
        status: "pending",
      })
      .populate(["sender", "recipient"], "-password")
      .lean({ virtuals: true });
    return request;
  }
  async getSentRequest(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const request = await this.friendRequestModel
      .find({
        sender: userId,
        status: "pending",
      }).populate(["sender","recipient"], "-password").lean({virtuals:true});
    return request;
  }
  async createRequest(sender: string, recipient: string, message?: string) {
      const exist = await this.friendRequestModel.findOne({ sender: sender, recipient: recipient });
      if (exist) {
        throw new ConflictException("You sent to the Friend Request");
      }
      const request = await this.friendRequestModel.findOne({
        recipient: sender,
        sender: recipient,
      });
      if(request && request.status === "accepted")
        throw new ConflictException("You are already friends");
      if (request) {
        request.status = "accepted";
        const chat=await this.chatService.createPrivateChat(sender, recipient);
        console.log(chat)
        await request.save();
        return request.toObject();
      }
      const newRequest = new this.friendRequestModel({
        sender: sender,
        recipient: recipient,
        status: "pending",
        message: message || "",
      });
    await newRequest.save();
    const populatedRequest = await newRequest.populate("recipient","-password")

      return populatedRequest.toObject();
  }
  async acceptRequest(userId: string, id: string) {
    const request = await this.friendRequestModel.findById(id);
    if (!request) throw new NotFoundException("Request not found");
    if (request.recipient.toString() != userId)
      throw new ForbiddenException("Request not found");
    request.status = "accepted";
    await request.save();
    await this.chatService.createPrivateChat(userId, request.sender.toString());
    return request.toObject();
  }
async getFriendByUserId(userId: string) {
  const user = await this.userService.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  const requests = await this.friendRequestModel
    .find({
      $or: [
        { sender: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    })
    .populate("sender", ["-password","-usersBlocked"])
    .populate("recipient", ["-password","-usersBlocked"]);

  const friends = requests.map((request) => {
    const sender = request.sender as unknown as UserDocument;
    const recipient = request.recipient as unknown as UserDocument;

    if (sender._id.toString() === userId) {
      return recipient.toObject();
    } else {
      return sender.toObject();
    }
  });

  return friends;
}
async deleteRequest(id: string, userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const request = await this.friendRequestModel.findById(id);
    if (!request) throw new NotFoundException("Request not found");
    if (request.sender.toString() != userId && request.recipient.toString() != userId )
      throw new ForbiddenException("Request not found");
    await this.friendRequestModel.deleteOne({ _id: request._id });
    return {
      message: "Request deleted successfully",
    };
  }
  async deleteFriend(userId: string, friendId: string) {
    const user = await this.userService.findById(userId);
    const friend = await this.userService.findById(friendId);
    if (!user || !friend) throw new NotFoundException("User not found");
    const request= await this.friendRequestModel.findOne({
      $or: [
        { sender: userId, recipient: friendId, status: "accepted" },
        { sender: friendId, recipient: userId, status: "accepted" },
      ],
    }).lean()
    if(!request) throw new NotFoundException("Friend not found")
    await this.friendRequestModel.deleteOne({_id:request._id})
    return {
      message: "Friend deleted successfully",
    }
  }
  async checkFriend(userId:string,friendId:string) {
    const request= await this.friendRequestModel.findOne({
      $or: [
        { sender: userId, recipient: friendId, status: "accepted" },
        { sender: friendId, recipient: userId, status: "accepted" },
      ],
    }).lean({virtuals:true})
    if(!request) return false;
    return request;
  }
  async getUserByEmail(userId: string, email: string) {
    const user = await this.userService.findByEmail(email)
    if (!user) throw new NotFoundException("User not found");

    const exist = await this.checkFriend(userId, user._id.toString());
    if (exist) throw new BadRequestException("You are already friends");
    const { status, password, ...userData } = user;
    console.log(userData)
    return userData;
  }
}
