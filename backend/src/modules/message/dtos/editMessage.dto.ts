import { IsNotEmpty, IsString, Length } from "class-validator";

export class EditMessageDto {
  @IsNotEmpty()
  @Length(1)
  @IsString()
  newContent:string;
}