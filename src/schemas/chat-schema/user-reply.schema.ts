import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserReplyDocument = HydratedDocument<UserReply>;

@Schema()
export class UserReply {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId;

  @Prop([{ type: String, required: true, default: [] }])
  reply: string[];

  @Prop({ type: Date, required: true })
  replyTime: Date;

  @Prop({ type: Date, required: true })
  targetTimeToSend: Date;

  @Prop([{ type: String }])
  targetContent?: string[];
}

export const UserReplySchema = SchemaFactory.createForClass(UserReply);
