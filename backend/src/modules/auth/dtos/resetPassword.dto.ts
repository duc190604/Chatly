import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email:string;
  @IsNotEmpty()
  @Length(6)
  newPassword:string;
}