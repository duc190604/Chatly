import { IsNotEmpty } from "class-validator";

export class DeleteAllMessagesDto {
  @IsNotEmpty()
  chatId:string;
}