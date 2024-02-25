import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ChatLog } from './chat-log.schema';

export type ChatCacheDocument = HydratedDocument<ChatCache>;

@Schema()
export class ChatCache {
  @Prop({ type: ChatLog, required: true, _id: false })
  chatLog: ChatLog;
}

export const ChatCacheSchema = SchemaFactory.createForClass(ChatCache);
ChatCacheSchema.index({ 'chatLog.timeToSend': 1 });
