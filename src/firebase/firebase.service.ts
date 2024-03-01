import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { readFileSync } from 'fs';
import { join } from 'path';

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
