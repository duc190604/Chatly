import { IsNotEmpty, Length } from "class-validator";

export class FindMessageDto {
  @IsNotEmpty()
  chatId: string;
  @IsNotEmpty()
  @Length(1)
  search: string;
}