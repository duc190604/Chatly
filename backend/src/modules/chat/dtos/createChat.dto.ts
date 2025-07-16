import { BaseDto } from "../../../common/base.dto";
import { Prop } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { IsObjectId } from "../../../common/customDecorator/validation-ObjectId.decorator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateChatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  members: string[];
  @ApiProperty()
  isGroup: boolean=false;
  @ApiPropertyOptional()
  @IsOptional()
  avatar?: string;
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;
}