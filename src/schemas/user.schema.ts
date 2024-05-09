import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';

@Schema()
export class ChatRoomData {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId;

  @Prop({ type: String })
  nickname: string;

  @Prop({ type: Date, required: true, default: Date.now })
  createdDate: Date;

  @Prop({ type: Date })
  lastAccess: Date;

  @Prop({ type: String })
  lastChat: string;

  @Prop({ type: Number, default: 0 })
  unreadCounts: number;

  @Prop({ type: Date })
  lastChatDate: Date;
}

export const ChatRoomDataSchema = SchemaFactory.createForClass(ChatRoomData);

@Schema()
export class User {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({
    type: [
      {
        provider: { type: String, required: true },
        id: { type: String, required: true, unique: true },
      },
    ],
    _id: false, // Avoid generating a subdocument "_id" field
  })
  oauthAccounts: {
    provider: string;
    id: string;
  }[];

  @Prop()
  nickname: string;

  // @Prop({ unique: true })
  // email: string;

  // @Prop({ unique: true })
  // phoneNum: string;

  // @Prop()
  // gender: string;

  @Prop({ type: String, default: 'user' })
  role: string;

  // @Prop()
  // age: number;

  @Prop({ type: Boolean, default: true })
  isNew: boolean;

  @Prop([
    { type: Types.ObjectId, required: false, ref: 'Character', default: [] },
  ])
  contributedCharacters: Types.ObjectId[];

  @Prop([
    {
      type: Types.ObjectId,
      required: true,
      ref: 'Character',
      default: [],
    },
  ])
  subscribedCharacters: Types.ObjectId[];

  @Prop({ type: Map, of: ChatRoomDataSchema, default: () => ({}), _id: false })
  chatRoomDatas: Map<string, ChatRoomData>;

  @Prop([
    { type: Types.ObjectId, required: false, ref: 'Subscription', default: [] },
  ])
  subscriptionIds: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, required: false, default: [] }])
  rejectedIds: Types.ObjectId[];

  @Prop({ type: String, required: false })
  fcmToken: string;

  @Prop({ type: Date, default: Date.now })
  lastAccess: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  { 'oauthAccounts.provider': 1, 'oauthAccounts.id': 1 },
  { unique: true },
);
