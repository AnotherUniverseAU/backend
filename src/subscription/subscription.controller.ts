import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { SubscriptionService } from './subscription.service';
import { UserDocument } from 'src/schemas/user.schema';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @UseGuards(CommonJwtGuard)
  @Post('subscribe')
  @HttpCode(201)
  async requestSubscription(
    @Req() req: Request,
    @Body('characterId') characterId: string,
  ) {
    const user = req.user as UserDocument;
    if (user.subscribedCharacters.includes(new Types.ObjectId(characterId)))
      throw new HttpException('already subscribed', HttpStatus.BAD_REQUEST);

    const subscription = await this.subscriptionService.requestSubscription(
      user,
      characterId,
    );

    return subscription;
  }

  @UseGuards(CommonJwtGuard)
  @Post('unsubscribe')
  @HttpCode(200)
  async requestUnsubscription(
    @Req() req: Request,
    @Body('subscriptionId') subscriptionId: string,
    @Body('endReason') endReason: string,
  ) {
    const user = req.user as UserDocument;
    if (
      !subscriptionId ||
      !user.subscriptionIds.includes(new Types.ObjectId(subscriptionId))
    ) {
      throw new HttpException('no subscription Id', HttpStatus.BAD_REQUEST);
    }

    const subscription = await this.subscriptionService.requestUnsubscription(
      user,
      subscriptionId,
      endReason,
    );
    return subscription;
  }
}
