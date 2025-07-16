import { Expose } from "class-transformer";

export class ResVerifyEmailDto {
  @Expose()
  token:string;
}