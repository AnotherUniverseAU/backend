import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

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

  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true })
  phoneNum: string;

  @Prop()
  gender: string;

  @Prop({ type: String, default: 'user' })
  role: string;

  @Prop()
  age: number;

  @Prop({ type: Boolean, default: true })
  isNew: boolean;

  @Prop([
    { type: Types.ObjectId, required: false, ref: 'Character', default: [] },
  ])
  contributedCharacters: Types.ObjectId[];

  @Prop([
    {
      type: Types.ObjectId,
      required: false,
      unique: true,
      ref: 'Character',
      default: [],
    },
  ])
  subscribedCharacters: Types.ObjectId[];

  @Prop([
    { type: Types.ObjectId, required: false, ref: 'Subscription', default: [] },
  ])
  subscriptionIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  { 'oauthAccounts.provider': 1, 'oauthAccounts.providerId': 1 },
  { unique: true },
);
