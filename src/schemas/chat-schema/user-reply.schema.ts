import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserReplyDocument = HydratedDocument<UserReply>;

@Schema()
export class replyFormat {
  @Prop({ type: String, required: true })
  userReply: string;

  @Prop({ type: Date, required: true })
  replyTime: Date;
}

@Schema()
export class UserReply {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId;

  @Prop([{ type: replyFormat, required: true, default: [] }])
  reply: replyFormat[];

  @Prop({ type: Date, required: true })
  targetTimeToSend: Date;

  @Prop([{ type: String }])
  targetContent?: string[];

  @Prop({ type: Boolean, required: true, default: false })
  isAfterCharacterReply: boolean;
}

export const UserReplySchema = SchemaFactory.createForClass(UserReply);
