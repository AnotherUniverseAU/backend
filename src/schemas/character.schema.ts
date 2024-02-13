import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateAxiosDefaults } from 'axios';
import { HydratedDocument, SchemaType, SchemaTypes, Types } from 'mongoose';
import { CreateDateColumn } from 'typeorm';

export type CharacterDocument = HydratedDocument<Character>;

@Schema()
export class UserReference {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  nickname: string;
}

@Schema()
export class Character {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: UserReference })
  creator: UserReference;

  @Prop({ type: String })
  creatorWords: string;

  @Prop({ type: [UserReference], default: [] })
  contributors: UserReference[];

  @Prop()
  name: string;

  @Prop()
  title: string;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: String, default: 'https://test.png' })
  imgUrl: string;

  @Prop({ type: Number, default: 0 })
  likes: number;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
