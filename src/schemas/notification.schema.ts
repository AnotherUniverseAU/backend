import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedArraySubdocument, HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
