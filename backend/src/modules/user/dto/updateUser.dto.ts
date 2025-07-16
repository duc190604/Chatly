import { IsOptional } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  username:string;
  @IsOptional()
  birthday:Date;
  @IsOptional()
  status:string;
  @IsOptional()
  description:string;
  @IsOptional()
  avatar:string;
  @IsOptional()
  coverImage:string;
}