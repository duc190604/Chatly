import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query } from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";
import { GetUser } from "../../common/customDecorator/get-user.decorator";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ResponseUserDto } from "../user/dto/responseUser.dto";
import { DeleteFriendDto } from "./dtos/deleteFriend.dto";
import { GetInfoByEmailDto } from "./dtos/getInfoByEmail.dto";
import { CheckFriendDto } from "./dtos/checkFriend.dto";
import { ResponseReqDto } from "./dtos/responseReq.dto";
@ApiBearerAuth('access-token')
@Controller("api/friends")
export class FriendController {
  constructor(private readonly friendRequestService: FriendRequestService) {
  }
  @ApiOperation({summary:"Get all friends"})
  @Get()
  async getFriend(@GetUser() user:any){
    const requests= await this.friendRequestService.getFriendByUserId(user.userId)
    return ResponseUserDto.plainToInstance(requests)
  }
  @ApiOperation({summary:"Delete friend"})
  @Delete("/:friendId")
  async deleteFriend(@Param() params:DeleteFriendDto, @GetUser() user:any){
    const request= await this.friendRequestService.deleteFriend(user.userId,params.friendId)
    return request
  }
  @Get("info")
  async getUserInfo(@Query() query:GetInfoByEmailDto, @GetUser() user:any){
    const info= await this.friendRequestService.getUserByEmail(user.userId,query.email)
    return ResponseUserDto.plainToInstance(info)
  }
  @Post("check")
  async checkFriend (@Body() body:CheckFriendDto, @GetUser() user:any){
    const friend= await this.friendRequestService.checkFriend(user.userId,body.friendId)
    if(!friend) throw new NotFoundException("Don't have friend with this id")
    return ResponseReqDto.plainToInstance(friend)
  }

}