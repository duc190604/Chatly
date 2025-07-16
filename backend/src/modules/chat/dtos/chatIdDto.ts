import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class ChatIdDto {
  @IsNotEmpty()
  chatId:string;
}