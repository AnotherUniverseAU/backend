import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HydratedDocument, Types } from 'mongoose';

export type CharacterChatDocument = HydratedDocument<CharacterChat>;

@Schema()
export class ChatLog {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId; //id of the owner(character)

  @Prop([{ type: String, required: true }])
  content: string[]; //the actual content of chat => the img is labeled "$img"

  @Prop([{ type: String }])
  imgUrl: string[]; //the urls of the image saved in order

  @Prop({ type: Date, required: true })
  timeToSend: Date; //the time of sending the message
}

@Schema()
export class CharacterChat {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId;

  @Prop({ type: [ChatLog], default: [] })
  chatLog: ChatLog[];
}

export const CharacterChatSchema = SchemaFactory.createForClass(CharacterChat);
