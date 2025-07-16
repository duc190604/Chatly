import { IsEnum, IsMongoId, IsNotEmpty, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
}

export class SendMessageDto {
  @IsNotEmpty()
  @Length(1)
  content: string;
  @IsNotEmpty()
  @IsMongoId()
  chatId: string;
  @IsNotEmpty()
  @ApiProperty({ enum: MessageType, enumName: 'MessageType' })
  @IsEnum(MessageType)
  type: MessageType;

}