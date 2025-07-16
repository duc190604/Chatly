import { Expose, plainToInstance } from "class-transformer";
import { IsMongoId } from "class-validator";
import { convertObjectIdToString } from "./util/db.uitl";

export abstract class BaseDto {
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  // @IsMongoId()
  id: string;
  static plainToInstance<T>(this: new (...args: any[]) => T, obj: any): T {
    const realObj = convertObjectIdToString(obj);
    return plainToInstance(this, realObj, {
     excludeExtraneousValues:true,
      exposeUnsetFields:true,
      exposeDefaultValues:true,
    });
  }
}