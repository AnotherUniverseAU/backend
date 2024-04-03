import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { SubscriptionRepository } from 'src/repository/subscription.repository';
import { Subscription } from 'src/schemas/subscription.schema';
import { User } from 'src/schemas/user.schema';
import { SubscriptionDTO } from './dto/subscription.dto';

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
    if (oldSubscription) {
      console.log(oldSubscription, ' already subscribed');
      throw new HttpException('already subscribed', HttpStatus.BAD_REQUEST);
    }

    const subscription = await this.subsriptionRepo.create(subscriptionDTO);

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

    if (!subscription) {
      throw new HttpException('no subscription found', HttpStatus.BAD_REQUEST);
    }

    const payload = new SubscriptionEventDTO(
      user._id.toString(),
      subscription.characterId.toString(),
      subscription._id.toString(),
    );
    console.log(
      'emitting unsubscription event from subscription for ',
      payload,
    );
    this.eventEmitter.emit('unsubscribe-user', payload);
    await subscription.deleteOne();
  }
}
