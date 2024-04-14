import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedArraySubdocument, HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, required: true, default: Date.now })
  createdDate: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
