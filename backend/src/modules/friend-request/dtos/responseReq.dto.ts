import { IsMongoId, IsNotEmpty, IsString, IsEnum } from "class-validator";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { User } from "../../user/schemas/user.schema";
import { Types } from "mongoose";
import { BaseDto } from "../../../common/base.dto";
import { ResponseUserDto } from "../../user/dto/responseUser.dto";
import { TransformToDTO } from "../../../common/customDecorator/transformToDTO.decorator";
export class ResponseReqDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsMongoId()
  @TransformToDTO(ResponseUserDto)
  sender: string;
  @Expose()
  @IsNotEmpty()
  @IsMongoId()
 @TransformToDTO(ResponseUserDto)
  recipient: string;
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsEnum(["pending", "accepted"])
  status: string;
@Expose()
@IsString()
  message:string;
}
