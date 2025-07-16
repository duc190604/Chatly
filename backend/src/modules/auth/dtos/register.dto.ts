import {IsEmail, IsNotEmpty, IsOptional, Length} from "class-validator";

export class RegisterDto{
  @IsNotEmpty()
  @IsEmail()
  email:string;
  @IsNotEmpty()
  @Length(6)
  password:string;
  @IsNotEmpty()
  username:string;
  @IsNotEmpty()
  birthday:Date;
  @IsOptional()
  avatar:string;
  @IsOptional()
  status:string="Normal";
  @IsOptional()
  description:string;
}