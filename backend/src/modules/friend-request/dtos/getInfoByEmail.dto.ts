import { IsEmail, IsNotEmpty } from "class-validator";

export class GetInfoByEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email:string;
}