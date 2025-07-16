import { IsEmail, IsNotEmpty } from "class-validator";

export class VerifyEmailDto {
  @IsNotEmpty()
  code:number;
  @IsNotEmpty()
  @IsEmail()
  email:string;
}