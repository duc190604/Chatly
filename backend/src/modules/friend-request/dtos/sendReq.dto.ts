import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { IsObjectId } from "../../../common/customDecorator/validation-ObjectId.decorator";

export class SendReqDto {
  @IsNotEmpty()
  @IsMongoId()
  recipientId:string;
  @IsOptional()
  @IsString()
  message?:string;
}