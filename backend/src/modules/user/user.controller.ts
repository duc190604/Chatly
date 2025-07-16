import { Body, Controller, Get, Injectable, Patch, Post, Put, Query } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { GetUser } from "../../common/customDecorator/get-user.decorator";
import { ResponseUserDto } from "./dto/responseUser.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto";
import { GetInfoByEmailDto } from "../friend-request/dtos/getInfoByEmail.dto";
import {ChangeStatusDto} from "./dto/changeStatus.dto";

@Controller("api/users")
export class UserController {
  constructor(private userService: UserService) {
  }

  // @Get("me")
  // async getUser(@Body()id:string)
  // {
  //   return this.userService.findById(id)
  // }
  @Put("update")
  async updateUser(@Body() body: UpdateUserDto, @GetUser() user: any) {
    const userUpdated = await this.userService.updateUser(user.userId, body);
    return ResponseUserDto.plainToInstance(userUpdated);
  }

  @Post("change-status")
  async changeStatus(@Body() body: ChangeStatusDto, @GetUser() user: any) {
    console.log(body)
    const userUpdated = await this.userService.changeStatus(user.userId, body.status);
    return userUpdated;
  }

  @Patch("change-password")
  async changePassword (@Body() body: ChangePasswordDto, @GetUser() user:any){
    const userUpdated= await this.userService.changePassword(user.userId,body.oldPassword,body.newPassword)
    return userUpdated
}

}