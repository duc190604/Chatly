import { Transform } from "class-transformer";
import { Types } from "mongoose";
import { ClassConstructor, plainToInstance } from "class-transformer";
import 'reflect-metadata';
import { FIELD_EXCLUDE_KEY } from "./fieldExclude.decorator";

export function TransformToDTO<T extends object>(dtoClass: ClassConstructor<T>,options?: { allFields?: boolean })
{
  let excludeFields: string[] = [];
  if (!options?.allFields) {
    const instance = new dtoClass();
    excludeFields = Object.keys(instance).filter((key) => {
      return Reflect.getMetadata(FIELD_EXCLUDE_KEY, instance, key);
    });

  }
  return Transform(({ value }) => {
    const transformValue = (val: any) => {
      if (typeof val === "string") return val;
      if (val instanceof Types.ObjectId) return val.toString();
      if (val?.buffer instanceof Buffer)
        return new Types.ObjectId(val.buffer).toString();

      // Loại bỏ các field theo metadata
      if (excludeFields.length && val && typeof val === 'object') {
        val = { ...val };
        for (const field of excludeFields) {
          delete val[field];
        }
      }
      return plainToInstance(dtoClass, val, {
        excludeExtraneousValues: true,
      });
    };

    if (Array.isArray(value)) {
      return value.map(transformValue);
    }

    return transformValue(value);
  });
}
