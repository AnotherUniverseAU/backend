import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ChatCache } from 'src/schemas/chat-schema/chat-cache.schema';

@Injectable()
export class FirebaseService {
  private firebaseApp: any;
  private messagingService: any;
  constructor(configService: ConfigService) {
    const serviceAccountPath = configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    const serviceAccount = JSON.parse(serviceAccountPath);

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase app initialized');
    this.messagingService = getMessaging(this.firebaseApp);
  }

  //this listens to event from chatroom service
  @OnEvent('broadcast')
  async handleBroadcastEvent(payload: ChatCache) {
    const { characterId, content } = payload.chatLog;
    console.log('broadcasting to: ', characterId);
    await this.sendNotifications(characterId.toString(), content);
  }

  async sendNotifications(characterId: string, content: string[]) {
    const topic = characterId;
    const message = {
      topic,
      data: {
        content: JSON.stringify(content),
      },
    };

    await this.messagingService
      .send(message)
      .then((response: any) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error: any) => {
        console.log('Error sending message:', error);
      });
  }
}
