import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";
import { Optional } from "@nestjs/common";
import {Transform} from "class-transformer";

export class GetMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  chatId:string;
  @IsOptional()
  limit?:number = 25;
  @IsOptional()
  @ValidateIf((o) => o.lastMessageId !== "")
  @IsMongoId()
  lastMessageId?:string;
  @IsOptional()
  type?: string;
  @IsOptional()
  @Transform(({value}) => value === 'true')
  getRevoked?: boolean;
}