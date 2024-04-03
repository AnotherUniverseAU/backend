import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, HydratedDocumentFromSchema } from 'mongoose';

export type CancelReasonDocument = HydratedDocument<CancelReason>;

@Schema()
export class CancelReason {
  @Prop({ type: Number, required: true, default: -1 })
  cancelType: Number;

  @Prop({ type: String, required: false })
  cancelReasonDescription: String;

  @Prop({ type: Number, default: 0 })
  cancelCount: Number;

  @Prop({ type: String, required: false })
  cancelReason: String;
}

export const CancelReasonSchema = SchemaFactory.createForClass(CancelReason);
