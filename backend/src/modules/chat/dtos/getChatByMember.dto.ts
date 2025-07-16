import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetChatByMemberDto {
  @IsMongoId()
  @IsNotEmpty()
  memberId:string;
}