import { BaseDto } from "../../../common/base.dto";
import { Types } from "mongoose";
import { Expose, Transform } from "class-transformer";
import { ResponseUserDto } from "../../user/dto/responseUser.dto";
import { TransformToDTO } from "../../../common/customDecorator/transformToDTO.decorator";
export class ResponseChatDto extends BaseDto {
  @Expose()
  @TransformToDTO(ResponseUserDto)
  creator: Types.ObjectId;
  @Expose()
  @TransformToDTO(ResponseUserDto)
  members: Types.ObjectId[] = [];
  @Expose()
  lastMessage:Types.ObjectId;
  @Expose()
  @TransformToDTO(ResponseUserDto)
  membersBlocked:Types.ObjectId[] = [];
  @Expose()
  @TransformToDTO(ResponseUserDto)
  pinnedMessage:Types.ObjectId[]=[];
  @Expose()
  isGroup:boolean=false;
}