import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { response } from 'express';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
@Injectable()
export class FirebaseService {
  private firebaseApp: any;
  private messagingService: any;
  constructor(configService: ConfigService) {
    const serviceAccountPath = configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    const serviceAccount = JSON.parse(serviceAccountPath);
    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    console.log('Firebase app initialized');
    this.messagingService = getMessaging(this.firebaseApp);
  }

  //this listens to event from chatroom service
  // @OnEvent('broadcast')
  async handleBroadcastEvent(payload: CharacterChat) {
    const { _id, characterId, content } = payload;
    console.log('broadcasting to: ', characterId);
    await this.sendNotifications(payload);
  }

  async sendUserNotification(
    title: string,
    body: string[],
    token: string,
    characterId: string,
    isUserActive: boolean,
  ) {
    var route: any;
    var notification: any;

    if (isUserActive) {
      route = `/chatroom/${characterId}`;
      notification = { title, body };
    } else {
      route = '/chatlist';
      notification = {
        title: '오늘 최애가 보낸 메시지를 확인해 보세요 💌',
        body: [''],
      };
    }

    const message = {
      notification,
      data: {
        route,
      },
      android: {
        priority: 'high',
        notification: {
          color: '#6E7AE8',
        },
      },
      token,
    };

    await this.messagingService
      .send(message)
      .then((response: any) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error: any) => {
        console.log('Error sending message:', error);
      });
  }

  async sendNotifications(payload: CharacterChat) {
    const { _id, characterId, content } = payload;
    const topic = characterId;
    const message = {
      topic,
      data: {
        chatId: _id.toString(),
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
