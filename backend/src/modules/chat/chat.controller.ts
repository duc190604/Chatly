import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { GetUser } from "../../common/customDecorator/get-user.decorator";
import { ResponseChatDto } from "./dtos/responseChat.dto";
import { CreateChatDto } from "./dtos/createChat.dto";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ChatIdDto } from "./dtos/chatIdDto";
import { createSwaggerRes } from "../../common/util/createSwaggerRes.util";
import { GetChatByMemberDto } from "./dtos/getChatByMember.dto";
@ApiBearerAuth('access-token')
@Controller('api/chats')
export class ChatController {
  constructor(private chatService: ChatService) {
  }
  @ApiOperation({ summary: "Get all chats by user"})
  @Get()
  async getChatByUser(@GetUser() user:any) {
    const chats= await this.chatService.getChatByUserId(user.userId)
    return ResponseChatDto.plainToInstance(chats)
  }
  @ApiOperation({ summary: "Get chat by id"})
  @ApiOkResponse(createSwaggerRes(ResponseChatDto))
  @Get("/:chatId")
  async getChatById(@Param() params:ChatIdDto,@GetUser() user:any) {
    const chat = await this.chatService.getChatById(params.chatId, user.userId)
    return ResponseChatDto.plainToInstance(chat)
  }
  @Get("/:chatId/info")
  async getChatInfo(@Param() params:ChatIdDto,@GetUser() user:any) {
    const chat = await this.chatService.getChatById(params.chatId, user.userId)
    return chat
  }
  @Get("by-members")
  async getChatByMember(@Query() query:GetChatByMemberDto,@GetUser() user:any) {
    const chat = await this.chatService.getChatByUserIdAndMemberId(user.userId, query.memberId)
    return ResponseChatDto.plainToInstance(chat)
  }
  @ApiOperation({ summary: "Create chat"})
  @Post()
  async createChat(@Body() body: CreateChatDto, @GetUser() user:any){
    if(!body.isGroup){
      if(!body.members.includes(user.userId))
      {
        throw new NotFoundException("User not in members")
      }
      if(body.members.length>2)
       {
        throw new NotFoundException("Can't create chat with more than 2 members")
       }
      const member=body.members.find(member=>member!==user.userId)
      if(!member) {
        throw new NotFoundException("Member not found")
      }else {
        const chat= await this.chatService.createPrivateChat(user.userId, member.toString())
        return ResponseChatDto.plainToInstance(chat)
      }
    }
  }
  @ApiOperation({ summary: "Delete chat"})
  @Delete("/:chatId")
  async deleteChat(@Param() params:ChatIdDto, @GetUser() user:any){
     const chat= await this.chatService.findById(params.chatId)
    if(!chat) throw new NotFoundException("Chat not found")
    if(!chat.isGroup)
    {
      return this.chatService.deletePrivateChat(params.chatId,user.userId)
    }
  }



}