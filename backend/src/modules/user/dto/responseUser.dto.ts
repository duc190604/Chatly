import { Expose, Transform } from "class-transformer";
import { BaseDto } from "../../../common/base.dto";
import { IsEmail } from "class-validator";
import { Types } from "mongoose";
import { TransformToDTO } from "../../../common/customDecorator/transformToDTO.decorator";
import { FieldExclude } from "../../../common/customDecorator/fieldExclude.decorator";

export class ResponseUserDto extends BaseDto{
  @Expose()
  username:string;
  @Expose()
  avatar:string;
  @Expose()
  status:string;
  @Expose()
  description:string;
  @Expose()
  coverImage:string;
  @Expose()
  birthday:Date;
  @Expose()
  email:string;
  @FieldExclude()
  @Expose()
 @TransformToDTO(ResponseUserDto)
  usersBlocked:Types.ObjectId[]=[];
}