import { IsMongoId, IsNotEmpty } from "class-validator";

export class PinMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  chatId:string;
}