import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { Model } from "mongoose";
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { FriendRequestService } from "../friend-request/friend-request.service";
import { async } from "rxjs";
import { ChatService } from "../chat/chat.service";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) return null;
    return user;
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean({ virtuals: true });
  }
  async createUser(user: User): Promise<UserDocument> {
    const existUser = await this.userModel.findOne({ email: user.email });
    if (existUser) {
      throw new BadRequestException("Email already exists");
    }
    const create = await this.userModel.create(user);
    return create.toObject();
  }

  async updateUser(userId: string, info: Partial<User>) {
    const validFields = Object.keys(info).filter(
      (key) => info[key] !== undefined,
    );
    const updateData = validFields.reduce((acc, key) => {
      acc[key] = info[key];
      return acc;
    }, {});
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException("User not found");

    user.set(updateData);
    await user.save();
    return user.toObject();
  }

  async changeStatus(userId: string, status: string) {
    if (
      status !== "Happy" &&
      status !== "Sad" &&
      status !== "Bored" &&
      status !== "Normal" &&
      status !== "Angry"
    )
      throw new BadRequestException("Status does not exist");
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException("User not found");
    const update = await this.userModel.updateOne(
      { _id: user._id },
      { status: status },
    );
    return {
      message: "Status updated successfully",
    };
  }
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException("Old password is incorrect");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return {
      message: "Password updated successfully",
    };
  }
  async setNewPassword (email:string,newPassword:string) {
    if(newPassword.length < 6)
      throw new BadRequestException(
        "Password must be at least 6 characters long",
      )
     const user= await this.userModel.findOne({email:email})
    if(!user)
       throw new NotFoundException("Email does not exist")
    console.log(newPassword)
     user.password = await bcrypt.hash(newPassword, 10);
     await user.save();
     return {
       message: "Password updated successfully",
     };
  }
}