import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ChatLog } from './chat-log.schema';

export type CharacterChatDocument = HydratedDocument<CharacterChat>;

@Schema()
export class CharacterChat {
  @Prop({ type: ChatLog, required: true, _id: false })
  chatLog: ChatLog;
}

export const CharacterChatSchema = SchemaFactory.createForClass(CharacterChat);

CharacterChatSchema.index({
  'chatLog.timeToSend': 1,
  'chatLog.characterId': 1,
});
CharacterChatSchema.index({ 'chatLog.timeToSend': 1 });
