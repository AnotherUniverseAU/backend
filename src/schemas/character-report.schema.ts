import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CharacterReportDocument = HydratedDocument<CharacterReport>;

@Schema()
export class CharacterReport {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  reporterId: Types.ObjectId;

  @Prop({ type: String, length: 200 })
  complainment: string;
}

export const CharacterReportSchema =
  SchemaFactory.createForClass(CharacterReport);
