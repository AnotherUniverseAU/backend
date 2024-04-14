import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { Request } from 'express';
import { UserDocument } from 'src/schemas/user.schema';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('')
  @HttpCode(200)
  @UseGuards(CommonJwtGuard)
  async getNotifications() {
    const notifications = await this.notificationService.getNotifications();
    return { notifications };
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(CommonJwtGuard)
  async setNotification(
    @Req() req: Request,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('createdDate') createdDate?: Date,
  ) {
    const user = req.user as UserDocument;
    if (user.role !== 'admin') throw new UnauthorizedException('not admin');

    const notification = await this.notificationService.setNotification(
      title,
      content,
      createdDate,
    );

    return notification;
  }
}
