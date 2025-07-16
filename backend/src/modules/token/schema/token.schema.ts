import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from "mongoose";

export type TokenDocument = HydratedDocument<Token>;
@Schema()
export class Token {
  @Prop({ required: true })
  token: string;
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: string;
}
export const TokenSchema = SchemaFactory.createForClass(Token);