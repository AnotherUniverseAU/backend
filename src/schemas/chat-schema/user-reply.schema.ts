import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserReplyDocument = HydratedDocument<UserReply>;

@Schema()
export class UserReply {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userReply: string;

  @Prop({ type: Date, required: true })
  replyTime: Date;
}

export const UserReplySchema = SchemaFactory.createForClass(UserReply);
UserReplySchema.index({ userId: 1, characterId: 1, replyTime: 1 });
