import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class DeleteReqDto {
  @IsNotEmpty()
  @IsMongoId()
  requestId:string;
}