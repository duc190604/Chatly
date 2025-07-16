import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  WsExceptionFilter,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException, Error) // hoặc @Catch(WsException) nếu bạn chỉ muốn bắt WsException

export class AllWsExceptionsFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    const data = host.switchToWs().getData();
    const ack: Function | undefined = data?.ack;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let type = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      status = exception.getStatus();
      message = Array.isArray((res as any)?.message)
        ? (res as any).message.join(', ')
        : (res as any)?.message || exception.message;
      type = (res as any)?.error || exception.name || 'HttpException';
    } else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database error: ' + exception.message;
      type = 'MongoError';
    } else if (exception instanceof WsException) {
      message = exception.message;
      type = 'WsException';
    } else if (exception?.message) {
      message = exception.message;
      type = exception.name || 'UnknownException';
    }

    const errorPayload = {
      status: "error",
      error: {
        message,
        type,
        statusCode: status,
      },
    };

    // Nếu có ack callback, trả lỗi về cho client
    if (typeof ack === 'function') {
      return ack(errorPayload);
    }

    // Không có ack, fallback emit lỗi
    client.emit('socket_error', errorPayload);

    // Log
    console.error({
      statusCode: status,
      timestamp: new Date().toISOString(),
      event: data?.event || 'unknown_event',
      message,
      type,
    });
  }
}
