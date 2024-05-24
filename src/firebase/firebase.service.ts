import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { OnEvent } from '@nestjs/event-emitter';
// import { response } from 'express';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { winstonLogger } from 'src/common/logger/winston.util';
@Injectable()
export class FirebaseService {
  private firebaseApp: any;
  private messagingService: any;
  constructor(configService: ConfigService) {
    const serviceAccountPath = configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    const serviceAccount = JSON.parse(serviceAccountPath);

    // npm package 때문에 json 오류 생길 때 아래 주석 코드로 위 코드 대체

    // const serviceAccount = {
    //   projectId: configService.get<string>(
    //     'GOOGLE_APPLICATION_CREDENTIALS_PROJECT_ID',
    //   ),
    //   privateKey: configService
    //     .get<string>('GOOGLE_APPLICATION_CREDENTIALS_PRIVATE_KEY')
    //     .replace(/\\n/g, '\n'),
    //   clientEmail: configService.get<string>(
    //     'GOOGLE_APPLICATION_CREDENTIALS_CLIENT_EMAIL',
    //   ),
    // };
    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    console.log('Firebase app initialized');
    this.messagingService = getMessaging(this.firebaseApp);
  }

  async sendUserNotification(
    userId: string,
    title: string,
    body: string,
    token: string,
    characterId?: string,
    inactive?: boolean,
  ) {
    let route: string;
    if (inactive) {
      route = `/chatlist`;
    } else {
      route = `/chatroom/${characterId}`;
    }

    const notification = { title, body };

    const message = {
      notification,
      token,
      data: {
        route,
      },
      android: {
        priority: 'high',
        notification: {
          color: '#6E7AE8',
        },
      },
    };

    await this.messagingService
      .send(message)
      .then((response: any) => {
        winstonLogger.log(`Successfully sent message : ${userId}`, {
          message,
          response,
        });
      })
      .catch((error: any) => {
        winstonLogger.error(`${userId}에서 fcm 알림 발신 에러 발생: ${error}`);
      });
  }
}
