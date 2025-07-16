import { IsNotEmpty } from "class-validator";

export class CheckFriendDto {
  @IsNotEmpty()
  friendId:string;
}