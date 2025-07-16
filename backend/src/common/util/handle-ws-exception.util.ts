import { HttpException, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface HandleWsExceptionOptions {
  exception: any;
  client: Socket;
  ack?: Function;
  fallbackEvent?: string;
}

export function handleWsException({exception, client,ack,fallbackEvent = 'socket_error',}: HandleWsExceptionOptions) {
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
    status: 'error',
    error: {
      message,
      type,
      statusCode: status,
    },
  };
  const ackCallback = ack || undefined;
  if (typeof ackCallback === 'function') {
    return ackCallback(errorPayload);
  }

  // fallback emit lỗi
  client.emit(fallbackEvent, errorPayload);
  console.error({
    statusCode: status,
    message,
    type,
  });
}
// utils/validate-http-format.ts
