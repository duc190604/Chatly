import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const skip = this.reflector.get<boolean>(
      'skipResponseInterceptor',
      context.getHandler(),
    );
    if (skip) return next.handle();
    return next.handle().pipe(
      map((data) => {
        if (data?.password) delete data.password;
        if(data.data)
        {
          return {...data}
        }
        return { data };
      }),
    );
  }
}
