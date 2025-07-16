import { Expose } from "class-transformer";

export class ResponseUploadDto {
  @Expose()
  url:string;
  @Expose()
  public_id:string;
  @Expose()
  resource_type:string;
}