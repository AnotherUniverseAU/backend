import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model } from 'mongoose';
import { CancelReason } from 'src/schemas/cancel-reason.schema';

@Injectable()
export class CancelReasonRepository {
  constructor(
    @InjectModel(CancelReason.name)
    private CancelReasonModel: Model<CancelReason>,
  ) {}

  async create(cancelType: number, reason: string) {
    if (!reason) {
      await this.CancelReasonModel.updateOne(
        { cancelType: cancelType },
        { $inc: { cancelCount: 1 } },
        { upsert: true },
      );
    } else {
      await this.CancelReasonModel.create({
        cancelReason: reason,
        cancelCount: 1,
      });
    }
  }
}
