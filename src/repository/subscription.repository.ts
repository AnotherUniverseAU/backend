import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/schemas/subscription.schema';
import { SubscriptionDTO } from 'src/subscription/dto/subscription.dto';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  async create(subscriptionDTO: SubscriptionDTO): Promise<Subscription> {
    const subscription = new this.subscriptionModel({
      _id: new Types.ObjectId(),
      characterId: new Types.ObjectId(subscriptionDTO.characterId),
      userId: new Types.ObjectId(subscriptionDTO.userId),
      startDate: new Date(),
    });
    return await subscription.save();
  }

  async findByUserIdAndCharacterId(
    userId: Types.ObjectId,
    characterId: string,
  ): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionModel.findOne({
      userId: userId,
      characterId: new Types.ObjectId(characterId),
    });

    return subscription;
  }

  async patch(
    subscriptionId: string,
    params: Partial<Subscription>,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(
        new Types.ObjectId(subscriptionId),
        { ...params, endDate: new Date() },
        { new: true },
      )
      .exec();
    return subscription;
  }
}
