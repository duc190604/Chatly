import { IsNotEmpty, Length } from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword:string;
  @IsNotEmpty()
  @Length(6)
  newPassword:string;
}