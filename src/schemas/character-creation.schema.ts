import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type CharacterCreationDocument =
  HydratedDocument<CharacterCreationEntity>;

@Schema({ collection: 'charactercreations' })
export class CharacterCreationEntity {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  creator: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  genre: string;

  @Prop({ type: String, required: true })
  gender: string;

  @Prop({ type: String, required: true })
  creatorWords: string;

  @Prop({ type: String, required: true })
  appearance: string;

  @Prop({ type: String, required: true })
  personality: string;

  @Prop({ type: String, required: true })
  hobby: string;

  @Prop({ type: String, required: true })
  tone: string;

  @Prop({ type: String, required: true })
  extraInfo: string;

  @Prop({ type: String, required: true })
  summary: string;

  @Prop({ type: String, required: true })
  relationship: string;

  @Prop({ type: String, required: true })
  email: string;
}

export const CharacterCreationSchema = SchemaFactory.createForClass(
  CharacterCreationEntity,
);
