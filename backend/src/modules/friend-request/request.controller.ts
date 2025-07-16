import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";
import { GetUser } from "../../common/customDecorator/get-user.decorator";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SendReqDto } from "./dtos/sendReq.dto";
import { plainToClass, plainToInstance } from "class-transformer";
import { ResponseReqDto } from "./dtos/responseReq.dto";
import { AcceptReqDto } from "./dtos/acceptReq.dto";
import { DeleteReqDto } from "./dtos/deleteReq.dto";
@ApiBearerAuth("access-token")
@Controller("api/requests")
export class RequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}
  @ApiOperation({ summary: "Get all received request" })
  @Get()
  async getRequest(@GetUser() user: any) {
    const requests = await this.friendRequestService.getRequest(
      user.userId,
    );
    return ResponseReqDto.plainToInstance(requests);
  }
  @ApiOperation({ summary: "Send request" })
  @Post()
  @HttpCode(201)
  async sendRequest(@Body() data: SendReqDto, @GetUser() user: any) {
    const request = await this.friendRequestService.createRequest(
      user.userId,
      data.recipientId,
      data.message,
    );
    return ResponseReqDto.plainToInstance(request);
  }
  @ApiOperation({ summary: "Accept request" })
  @Post("accept")
  async acceptRequest(@Body() data: AcceptReqDto, @GetUser() user: any) {
    const request = await this.friendRequestService.acceptRequest(
      user.userId,
      data.requestId,
    );
    return ResponseReqDto.plainToInstance(request);
  }
  @ApiOperation({ summary: "Delete request" })
  @Delete("/:requestId")
  async deleteReq(@GetUser() user:any, @Param() params: DeleteReqDto){
    const request= await this.friendRequestService.deleteRequest(params.requestId,user.userId)
    return request
  }

}