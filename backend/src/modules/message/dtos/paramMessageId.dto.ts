import { IsMongoId, IsNotEmpty } from "class-validator";

export class ParamMessageIdDto {
  @IsNotEmpty()
  @IsMongoId()
  messageId:string;
}