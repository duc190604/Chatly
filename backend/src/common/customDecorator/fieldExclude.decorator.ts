// field-exclude.decorator.ts
import 'reflect-metadata';

export const FIELD_EXCLUDE_KEY = 'fieldExclude';

export function FieldExclude() {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(FIELD_EXCLUDE_KEY, true, target, propertyKey);
  };
}
