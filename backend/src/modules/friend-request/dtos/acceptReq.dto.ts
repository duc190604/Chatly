import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class AcceptReqDto {
  @IsNotEmpty()
  @IsMongoId()
  requestId:string;
}