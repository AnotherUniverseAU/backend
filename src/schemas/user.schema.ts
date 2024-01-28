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
    // _id: false, // Avoid generating a subdocument "_id" field
  })
  oauthAccounts: {
    provider: string;
    id: string;
  }[];

  @Prop({ unique: true })
  phoneNum: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop()
  birthYear: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  { 'oauthAccounts.provider': 1, 'oauthAccounts.providerId': 1 },
  { unique: true },
);
