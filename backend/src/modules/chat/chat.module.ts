import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatSchema } from "./schemas/chat.schema";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { MessageModule } from "../message/message.module";
import { UserModule } from "../user/user.module";
import { ChatGateway } from "./chat.gateway";
import { AuthModule } from "../auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { RedisClientService } from "../redis/redis-client.service";
import { FriendRequestModule } from "../friend-request/friend-request.module";

@Module({
  imports:[MongooseModule.forFeature([{name:"Chat",schema:ChatSchema}]),
    forwardRef(()=>MessageModule), UserModule,forwardRef(()=>FriendRequestModule),JwtModule],
  providers:[ChatService,ChatGateway],
  controllers:[ChatController],
  exports:[ChatService,MongooseModule.forFeature([{name:"Chat",schema:ChatSchema}])]
})
export class ChatModule {}