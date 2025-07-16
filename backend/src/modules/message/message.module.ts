import { forwardRef, Module } from "@nestjs/common";
import { Message, MessageSchema } from "./schemas/message.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { MessageService } from "./message.service";
import { ChatModule } from "../chat/chat.module";
import { MessageController } from "./message.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports:[MongooseModule.forFeature([{name:Message.name, schema:MessageSchema}]),forwardRef(()=>ChatModule),UserModule],
  controllers:[MessageController],
  providers:[MessageService],
  exports:[MessageService,MongooseModule.forFeature([{name:Message.name, schema:MessageSchema}])]
})
export class MessageModule {}