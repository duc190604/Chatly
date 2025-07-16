import { PickType } from "@nestjs/swagger";
import { VerifyEmailDto } from "./verify-email.dto";

export class SendCertificationDto extends PickType(VerifyEmailDto,["email"]) {}