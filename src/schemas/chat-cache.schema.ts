import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatCacheDocument = HydratedDocument<ChatCache>;

@Schema()
export class ChatCache {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Character' })
  characterId: Types.ObjectId; //id of the owner(character)

  @Prop([{ type: String, required: true }])
  content: string[]; //the actual content of chat => the img is labeled "$img"

  @Prop([{ type: String }])
  imgUrl: string[]; //the urls of the image saved in order

  @Prop({ type: Date, required: true })
  timeToSend: Date; //the time of sending the message
}

export const ChatCacheSchema = SchemaFactory.createForClass(ChatCache);
ChatCacheSchema.index({ timeToSend: 1 });
