import { BaseDto } from "../../../common/base.dto";
import { Expose, Transform } from "class-transformer";
import { TransformToDTO } from "../../../common/customDecorator/transformToDTO.decorator";
import { ResponseUserDto } from "../../user/dto/responseUser.dto";
import { ResponseChatDto } from "../../chat/dtos/responseChat.dto";

export class ResponseMessageDto extends BaseDto{
  @Expose()
  content:string;
  @Expose()
  type: 'text'| 'image'| 'audio'| 'video'| 'file';
  @Expose()
  @TransformToDTO(ResponseUserDto)
  sender:string;
  @Expose()
  @TransformToDTO(ResponseChatDto)
  chat:string;
  @TransformToDTO(ResponseUserDto)
  @Expose()
  usersDeleted:string[];
  @Expose()
  isEdited:boolean;
  @Expose()
  isRevoked:boolean;
  @Expose()
  status:'sent'| 'delivered'| 'seen';


}