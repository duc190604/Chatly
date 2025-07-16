import { Global, Module } from "@nestjs/common";
import { MailerService } from "./mailer.service";
@Global()
@Module({
  imports:[],
  controllers:[],
  providers:[MailerService],
  exports:[MailerService]
})
export class MailerModule {}