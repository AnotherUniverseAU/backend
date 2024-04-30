import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { UserDocument } from 'src/schemas/user.schema';
import { Request } from 'express';
import { winstonLogger } from 'src/common/logger/winston.util';

@Controller('firebase')
export class FirebsaeController {
  constructor(private firebaseService: FirebaseService) {}

  @UseGuards(CommonJwtGuard)
  @Post('send-notification')
  @HttpCode(200)
  async sendNotification(
    @Req() req: Request,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('isUserActive') isUserActive: boolean,
  ) {
    const user = req.user as UserDocument;
    if (user.role !== 'admin') throw new UnauthorizedException('not admin');
    if (!isUserActive) {
      winstonLogger.log(
        `휴면 계정입니다. : ${user._id}, 마지막 접속 : ${user.lastAccess}`,
      );
      return;
    }

    const fcmToken = user.fcmToken;

    if (!user.subscribedCharacters.length) {
      winstonLogger.error('no subscribed characters');
      throw new HttpException(
        'no subscribed characters',
        HttpStatus.BAD_REQUEST,
      );
    } else if (!fcmToken) {
      winstonLogger.error('no fcmToken');
      throw new HttpException('no fcmToken', HttpStatus.BAD_REQUEST);
    }

    const characterId = user.subscribedCharacters[0].toString();

    await this.firebaseService.sendUserNotification(
      title,
      body,
      fcmToken,
      characterId,
    );
    return { message: 'Notification sent' };
  }
}
