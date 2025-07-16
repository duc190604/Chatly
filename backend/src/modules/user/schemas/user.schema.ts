
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from "mongoose";
import { DEFAULT_AVATAR } from "../../../common/util/constants.util";
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true})
  username: string;
  @Prop({ required: true})
  password: string;
  @Prop({ required: true, unique: true})
  email: string;
  @Prop({default: DEFAULT_AVATAR})
  avatar: string;
  @Prop({default: DEFAULT_AVATAR})
  coverImage: string;
  @Prop({required: true})
  birthday: Date;
  @Prop()
  status: string;
  @Prop()
  description: string;
  @Prop({default: Date.now})
  lastSeen: Date;
  @Prop({required: false, type:[{type:Types.ObjectId, ref: 'User'}]})
  usersBlocked: string[];
  createdAt?: Date;
  updatedAt?: Date;
  id: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongooseLeanVirtuals)
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});
UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});
