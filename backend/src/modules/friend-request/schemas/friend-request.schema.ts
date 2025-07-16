import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import * as string_decoder from "node:string_decoder";

export type FriendRequestDocument = HydratedDocument<FriendRequest>;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class FriendRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  recipient: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending',
    required: true,
  })
  status: string;
  @Prop({type:String, required:false} )
  message:string

  createdAt?: Date;
  updatedAt?: Date;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
FriendRequestSchema.plugin(mongooseLeanVirtuals);

FriendRequestSchema.virtual('id').get(function () {
  return this._id.toString();
});
