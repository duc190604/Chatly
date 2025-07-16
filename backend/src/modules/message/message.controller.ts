import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { MessageService } from "./message.service";
import { GetUser } from "../../common/customDecorator/get-user.decorator";
import { GetMessageDto } from "./dtos/getMessage.dto";
import { SendMessageDto } from "./dtos/sendMessage.dto";
import { ParamMessageIdDto } from "./dtos/paramMessageId.dto";
import { EditMessageDto } from "./dtos/editMessage.dto";
import { ResponseMessageDto } from "./dtos/responseMessage.dto";
import { PaginationCursorDto } from "../../common/dtos/paginationCursorDto";
import { createSwaggerRes } from "../../common/util/createSwaggerRes.util";
import { FindMessageDto } from "./dtos/findMessage.dto";
import { ChatIdDto } from "../chat/dtos/chatIdDto";
import { DeleteAllMessagesDto } from "./dtos/deleteAllMessages.dto";

@ApiBearerAuth('access-token')
@Controller('api/messages')
export class MessageController {
  constructor(private messageService: MessageService) {
  }
  @ApiOperation({ summary: "Get all messages by chatId"})
  @Get()
  @ApiOkResponse(createSwaggerRes(ResponseMessageDto,PaginationCursorDto,true))
  // @SkipResponseInterceptor()
  async getMessagesByChatId(@Query() query:GetMessageDto,@GetUser() user:any){
    const lastMessageId=query.lastMessageId || "";
    const limit=query.limit || 25;
    const messages= await this.messageService.getMessage(user.userId,query.chatId,lastMessageId,limit, query?.type, query?.getRevoked)
    const data= ResponseMessageDto.plainToInstance(messages.data)
    const pagination= PaginationCursorDto.plainToInstance(messages.pagination)
   return {
     pagination,
     data,
   }
  }
  @Get("images")
  async getImagesByChatId(@Query() query:GetMessageDto,@GetUser() user:any){
    const lastMessageId=query.lastMessageId || "";
    const limit=query.limit || 25;
    const messages= await this.messageService.getImages(user.userId,query.chatId,lastMessageId,limit)
    const data= ResponseMessageDto.plainToInstance(messages.data)
    const pagination= PaginationCursorDto.plainToInstance(messages.pagination)
    return {
      pagination,
      data,
    }
  }
  @Get("files")
  async getFilesByChatId(@Query() query:GetMessageDto,@GetUser() user:any){
    const lastMessageId=query.lastMessageId || "";
    const limit=query.limit || 10;
    const messages= await this.messageService.getFiles(user.userId,query.chatId,lastMessageId,limit)
    const data= ResponseMessageDto.plainToInstance(messages.data)
    const pagination= PaginationCursorDto.plainToInstance(messages.pagination)
    return {
      pagination,
      data,
    }
  }
  @ApiOperation({ summary: "Send message to chat"})
  @Post()
  @ApiBody({type:SendMessageDto})
  async sendMessage(@Body() body:SendMessageDto, @GetUser() user:any){
    const message= await this.messageService.createMessage(user.userId,body.chatId,body.content,body.type)
    return ResponseMessageDto.plainToInstance(message)
  }
  @ApiOperation({summary:"Delete all messages in chat"})
  @Delete("delete-all")
  async deleteAllMessages (@Query() query:DeleteAllMessagesDto, @GetUser() user:any) {
    console.log("tss",query.chatId)
    const res = await this.messageService.deleteAllMessage(query.chatId,user.userId)
    return res;
  }

  @ApiOperation({ summary: "Delete message"})
  @Delete("/:messageId")
  async deleteMessage(@Param() params:ParamMessageIdDto, @GetUser() user:any){
    return this.messageService.deleteMessage(user.userId,params.messageId)
  }
  @ApiOperation({ summary: "Revoke message"})
  @Patch("/:messageId/revoke")
  async revokeMessage(@Param() params:ParamMessageIdDto, @GetUser() user:any){
    return this.messageService.revokeMessage(user.userId,params.messageId)
  }
  @ApiOperation({ summary: "Pin message"})
  @Patch("/:messageId/pin")
  async pinMessage(@Param() params:ParamMessageIdDto, @GetUser() user:any)
  {
    return this.messageService.pinMessage(user.userId,params.messageId)
  }
  @ApiOperation({ summary: "Unpin message"})
  @Patch("/:messageId/unpin")
  async unpinMessage(@Param() params:ParamMessageIdDto, @GetUser() user:any)
  {
    return this.messageService.unpinMessage(user.userId,params.messageId)
  }
  @ApiOperation({ summary: "Edit message"})
  @Patch("/:messageId/edit")
  async editMessage(@Param() params:ParamMessageIdDto, @GetUser() user:any, @Body() body:EditMessageDto)
  {
    const message= await this.messageService.editMessage(user.userId,params.messageId,body.newContent)
    return ResponseMessageDto.plainToInstance(message)
  }
  @Get("find")
  async findMessageByContent (@Query() query:FindMessageDto, @GetUser() user:any) {
    const message = await this.messageService.findMessages(query.chatId,query.search,user.userId)
    return ResponseMessageDto.plainToInstance(message)
  }


}