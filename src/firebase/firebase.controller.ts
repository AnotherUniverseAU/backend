import { Controller, HttpCode, Post } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
export class FirebsaeController {
  constructor(private firebaseService: FirebaseService) {}

  @Post('send-notification')
  @HttpCode(200)
  async sendNotification() {
    const characterId = '123';
    const content = ['Hello', 'World'];
    await this.firebaseService.sendNotifications(characterId, content);
    return { message: 'Notification sent' };
  }
}
