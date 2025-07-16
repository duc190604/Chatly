import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { UserSchema } from "../../user/schemas/user.schema";
import { MessageSchema } from "../../message/schemas/message.schema";
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
export type ChatDocument = HydratedDocument<Chat>;
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Chat {
  @Prop({required:true, ref:"User", type:Types.ObjectId})
  creator:string;
  @Prop({type: [{ type: Types.ObjectId, ref: "User" }]})
  members:string[];
  @Prop({required:false, default: false})
  isGroup:boolean;
  @Prop({ type: [{ type: Types.ObjectId, ref: "Message" }], required: false})
  pinnedMessages:string[];
  @Prop({ type: Types.ObjectId, ref: "Message", default: null })
  lastMessage:string;
  @Prop({ type: String, required: false })
  avatar:string;
  @Prop({ type: String, required: false })
  name:string;
  @Prop( { type: [{ type: Types.ObjectId, ref: "User" }], required: false })
  admins:string[];
  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], required: false })
  usersMuted: string[]
  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], required: false })
  membersBlocked: string[]
  @Prop({ type: Boolean, default: false, required: false })
  isAdminMode:boolean;
  @Prop({ type: Boolean, default: false, required: false })
  isFriend:boolean;
  id:Types.ObjectId;
  createdAt:Date;
  updatedAt:Date;
}
export const ChatSchema= SchemaFactory.createForClass(Chat);
ChatSchema.plugin(mongooseLeanVirtuals)
ChatSchema.virtual("id").get(function () {
  return this._id.toString();
});


