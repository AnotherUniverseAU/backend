import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Genre } from 'src/global/enum/genre.enum';

export type CharacterCreationDocument = HydratedDocument<CharacterCreation>;

@Schema()
export class CharacterCreation {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  creator: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, enum: Object.values(Genre) })
  genre: Genre;

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

export const CharacterCreationSchema =
  SchemaFactory.createForClass(CharacterCreation);
