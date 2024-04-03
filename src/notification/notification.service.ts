import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async getNotifications(): Promise<Notification[]> {
    const notifications = await this.notificationModel.find({});
    return notifications;
  }

  async setNotification(title: string, content: string): Promise<Notification> {
    const notification = await this.notificationModel.create({
      title,
      content,
    });
    return notification;
  }
}
