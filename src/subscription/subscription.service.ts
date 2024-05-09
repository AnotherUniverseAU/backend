import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { SubscriptionRepository } from 'src/repository/subscription.repository';
import { Subscription } from 'src/schemas/subscription.schema';
import { User } from 'src/schemas/user.schema';
import { SubscriptionDTO } from './dto/subscription.dto';
import { Types } from 'mongoose';
import { winstonLogger } from 'src/common/logger/winston.util';

@Injectable()
export class SubscriptionService {
  constructor(
    private subsriptionRepo: SubscriptionRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async requestSubscription(
    user: User,
    characterId: string,
  ): Promise<Subscription> {
    const subscriptionDTO = new SubscriptionDTO(
      user._id.toString(),
      characterId,
    );

    const oldSubscription =
      await this.subsriptionRepo.findByUserIdAndCharacterId(
        user._id,
        characterId,
      );
    let subscription: Subscription;
    if (oldSubscription) subscription = oldSubscription;
    else subscription = await this.subsriptionRepo.create(subscriptionDTO);

    console.log(
      'emitting subscription event from subscription for ',
      user.nickname,
      characterId,
    );
    const payload = new SubscriptionEventDTO(
      user._id.toString(),
      characterId,
      subscription._id.toString(),
    );
    //this goes to both user and chatroom gateway
    this.eventEmitter.emit('subscribe-user', payload);

    return subscription;
  }

  async requestUnsubscription(user: User, characterId: string) {
    const subscription = await this.subsriptionRepo.findByUserIdAndCharacterId(
      user._id,
      characterId,
    );
    console.log(subscription);

    let payload: SubscriptionEventDTO;

    if (!subscription) {
      payload = new SubscriptionEventDTO(user._id.toString(), characterId, '');
    } else {
      payload = new SubscriptionEventDTO(
        user._id.toString(),
        characterId.toString(),
        subscription._id.toString(),
      );
      await subscription.deleteOne();
    }
    console.log(
      'emitting unsubscription event from subscription for ',
      payload,
    );
    //this goes to both user and chatroom service
    this.eventEmitter.emit('unsubscribe-user', payload);
  }

  @OnEvent('reject-character')
  async requestUnsubscriptionFromReject(
    userId: Types.ObjectId,
    characterId: string,
  ) {
    const subscription = await this.subsriptionRepo.findByUserIdAndCharacterId(
      userId,
      characterId,
    );

    let payload: SubscriptionEventDTO;

    if (!subscription) {
      payload = new SubscriptionEventDTO(userId.toString(), characterId, '');
    } else {
      payload = new SubscriptionEventDTO(
        userId.toString(),
        characterId.toString(),
        subscription._id.toString(),
      );
      await subscription.deleteOne();
    }

    winstonLogger.log(`[reject-character] ${userId} unsubscribed`);
    this.eventEmitter.emit('unsubscribe-user', payload);
  }
}
