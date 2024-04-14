import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { UserDocument } from 'src/schemas/user.schema';
import { Request } from 'express';

@Controller('firebase')
export class FirebsaeController {
  constructor(private firebaseService: FirebaseService) {}

  @UseGuards(CommonJwtGuard)
  @Post('send-notification')
  @HttpCode(200)
  async sendNotification(
    @Req() req: Request,
    @Body('title') title: string,
    @Body('body') body: string[],
    @Body('userId') userId: string,
    @Body('isUserActive') isUserActive: boolean,
  ) {
    const user = req.user as UserDocument;
    if (user.role !== 'admin') throw new UnauthorizedException('not admin');

    const fcmToken = user.fcmToken;
    const characterId = user.subscribedCharacters[0].toString();

    await this.firebaseService.sendUserNotification(
      title,
      body,
      fcmToken,
      characterId,
      isUserActive,
    );
    return { message: 'Notification sent' };
  }
}
