import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { AuthController } from "./auth.controller";
import { TokenModule } from "../token/token.module";
import { MailerService } from "../mailer/mailer.service";
import { RedisClientService } from "../redis/redis-client.service";
import { TokenService } from "../token/token.service";
import { WsJwtGuard } from "./guards/ws-jwt.guard";

@Module({
  imports: [UserModule,JwtModule,TokenModule],
  providers:[AuthService,JwtStrategy,JwtRefreshStrategy,WsJwtGuard],
  controllers:[AuthController],
  exports:[WsJwtGuard,JwtModule]
})
export class AuthModule{}
