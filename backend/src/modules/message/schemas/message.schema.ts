import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
export type MessageDocument = HydratedDocument<Message>;
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  SEEN = 'seen',
}
@Schema({ timestamps: true, toJSON: { virtuals: true },toObject: { virtuals: true } })
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Chat', required: true })
  chat: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: ['text', 'image', 'audio', 'video', 'file'], required: true })
  type: string;

  @Prop({ type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent', required: true })
  status: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', required: false })
  usersDeleted: string[];

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop({ default: false })
  isEdited: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.plugin(mongooseLeanVirtuals)

// Thêm virtual field "id"
MessageSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
MessageSchema.set("toObject", {
  virtuals: true,       // nếu bạn có dùng virtuals
  versionKey: false,    // loại bỏ __v nếu muốn
  transform: (_, ret) => {
    // Biến tất cả ObjectId thành string
    for (const key in ret) {
      if (ret[key] instanceof Types.ObjectId) {
        ret[key] = ret[key].toString();
      }
      // Nếu nested object
      if (typeof ret[key] === 'object' && ret[key] !== null) {
        for (const innerKey in ret[key]) {
          if (ret[key][innerKey] instanceof Types.ObjectId) {
            ret[key][innerKey] = ret[key][innerKey].toString();
          }
        }
      }
    }
    return ret;
  },
});
