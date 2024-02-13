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

  async requestUnsubscription(
    user: User,
    subscriptionId: string,
    endReason: string,
  ) {
    console.log(user, subscriptionId, endReason);
    const subscription = await this.subsriptionRepo.patch(subscriptionId, {
      endReason: endReason,
    });
    if (!subscription) {
      throw new HttpException('subscription not found', HttpStatus.NOT_FOUND);
    }

    const payload = new SubscriptionEventDTO(
      user._id.toString(),
      subscription.characterId.toString(),
      subscriptionId,
    );
    console.log(
      'emitting unsubscription event from subscription for ',
      payload,
    );
    this.eventEmitter.emit('unsubscribe-user', payload);
  }
}
