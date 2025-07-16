// auth/ws-jwt.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService,
              private configService: ConfigService,) {}

  canActivate(context: ExecutionContext): boolean {
    console.log("test")
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth?.token || client.handshake.query?.token;

    if (!token) throw new UnauthorizedException('No token provided');
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    try {
      const payload = this.jwtService.verify(token, {
        secret: secret,
      });
      client.data.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
