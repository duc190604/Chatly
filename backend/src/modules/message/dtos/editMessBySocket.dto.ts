import { IsMongoId, IsNotEmpty, IsString, Length } from "class-validator";

export class EditMessBySocketDto {
  @IsNotEmpty()
  @Length(1)
  @IsString()
  newContent:string;
  @IsNotEmpty()
  @IsMongoId()
  messageId:string;
}
