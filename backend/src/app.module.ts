import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MongooseConfigService } from "./config/mongoDB.config";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MailerService } from "./modules/mailer/mailer.service";
import { RedisClientService } from "./modules/redis/redis-client.service";
import { FriendRequestModule } from "./modules/friend-request/friend-request.module";
import { ChatModule } from "./modules/chat/chat.module";
import { MessageModule } from "./modules/message/message.module";
import { RedisModule } from "./modules/redis/redis.module";
import { UploadModule } from "./modules/upload/upload.module";
import { MailerModule } from "./modules/mailer/mailer.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    RedisModule,
    UploadModule,
    MailerModule,
    UserModule,
    AuthModule,
    FriendRequestModule,
    ChatModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
