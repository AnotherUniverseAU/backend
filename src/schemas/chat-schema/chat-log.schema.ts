import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class ChatLog {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Character',
    unique: false,
  })
  characterId: Types.ObjectId; //id of the owner(character)

  @Prop([{ type: String, required: true }])
  content: string[]; //the actual content of chat => the img is labeled "$img"

  @Prop([{ type: String, default: [] }])
  reply?: string[]; //the reply to the client's response

  @Prop([{ type: String, default: [] }])
  imgUrl?: string[]; //the urls of the image saved in order

  @Prop({ type: Date, required: true })
  timeToSend: Date; //the time of sending the message
}
