import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const res=exception?.response;
    console.log(exception)
    if(exception instanceof HttpException)
    {
      response.status(exception.getStatus()).json({
        error: {
          message: Array.isArray(res?.message) ? res.message.join(", ") : res?.message || exception.message,
          type: res?.error || exception.name || 'Internal Server Error',
          statusCode: exception.getStatus(),
        }
      })
      return;
    }
    let status =HttpStatus.INTERNAL_SERVER_ERROR;
    let message ='Internal server error';
    // Xử lý riêng lỗi Mongo
    if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database error: ' + exception.message;
    }
    // console.error({
    //   statusCode: status,
    //   timestamp: new Date().toISOString(),
    //   path: request.url,
    //   message: exception?.message || message,
    // });
    response.status(status).json({
      error: {
        message: Array.isArray(message) ? message.join(", ") : message,
        type: exception.name || 'Internal Server Error',
        statusCode: status,
      }
    })
  }
}
