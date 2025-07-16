import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  FriendRequest,
  FriendRequestSchema,
} from "./schemas/friend-request.schema";
import { FriendRequestService } from "./friend-request.service";
import { UserModule } from "../user/user.module";
import { RequestController } from "./request.controller";
import { FriendController } from "./friend.controller";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [
    forwardRef(()=>UserModule),
    ChatModule,
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),

  ],
  providers: [FriendRequestService],
  controllers: [RequestController, FriendController],
  exports: [FriendRequestService],
})
export class FriendRequestModule {}
