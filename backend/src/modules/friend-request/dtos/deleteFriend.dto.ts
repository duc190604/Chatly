import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class DeleteFriendDto {
  @IsNotEmpty()
  @IsMongoId()
  friendId:string;
}