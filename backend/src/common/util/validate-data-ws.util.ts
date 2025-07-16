import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateDataWs<T extends object>(dto: new () => T, data: any): Promise<T> {
  const instance = plainToInstance(dto, data);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
  });
  return instance
}

