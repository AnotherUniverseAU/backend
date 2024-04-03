import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CharacterChatDocument = HydratedDocument<CharacterChat>;

@Schema()
export class CharacterChat {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Character',
    unique: false,
  })
  characterId: Types.ObjectId; //id of the owner(character)

  @Prop({ type: String, required: true })
  characterName: string; //name of the owner(character)

  @Prop([{ type: String, required: true }])
  content: string[]; //the actual content of chat => the img is labeled "$img"

  @Prop([{ type: String, default: [] }])
  reply?: string[]; //the reply to the client's response

  @Prop({ type: Date, required: true })
  timeToSend: Date; //the time of sending the message

  constructor(chats: any) {
    this.characterId = new Types.ObjectId(chats.characterId);
    this.characterName = chats.characterName;
    this.content = chats.content;
    this.timeToSend = chats.timeToSend;
    this.reply = chats.reply;
  }
}

export const CharacterChatSchema = SchemaFactory.createForClass(CharacterChat);

CharacterChatSchema.index({
  timeToSend: 1,
  characterId: 1,
});
CharacterChatSchema.index({ timeToSend: 1 });
