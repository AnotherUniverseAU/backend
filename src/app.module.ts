import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthModule } from './oauth/oauth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CharacterModule } from './character/character.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatRoomModule } from './chatroom/chatroom.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { SubscriptionModule } from './subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { FirebaseModule } from './firebase/firebase.module';
@Module({
  imports: [
    AuthModule,
    OauthModule,
    UserModule,
    CharacterModule,
    ChatRoomModule,
    SubscriptionModule,
    FirebaseModule,
    // AgendaModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get<string>('MONGODB_ID')}:${configService.get<string>('MONGO_DB_PWD')}@cluster0.aunvoxf.mongodb.net/?retryWrites=true&w=majority`,
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          type: 'single',
          url: configService.get<string>('REDIS_URL'),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
