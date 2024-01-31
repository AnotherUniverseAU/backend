import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Gender {
  M = 'male',
  F = 'female',
}

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

  @Prop({ unique: true, sparse: true })
  userId: string;

  @Prop({ enum: Gender })
  gender: string;

  @Prop({ unique: true })
  phoneNum: string;

  @Prop()
  age: number;

  @Prop({ default: false })
  verified: boolean;

  @Prop()
  verificationCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  { 'oauthAccounts.provider': 1, 'oauthAccounts.providerId': 1 },
  { unique: true },
);
