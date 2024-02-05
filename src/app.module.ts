import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { OauthModule } from './oauth/oauth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-filter';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CharacterModule } from './character/character.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AgendaModule } from './agenda/agenda.module';
@Module({
  imports: [
    AuthModule,
    OauthModule,
    UserModule,
    // AgendaModule,
    ScheduleModule.forRoot(),
    CharacterModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get<string>('MONGODB_ID')}:${configService.get<string>('MONGO_DB_PWD')}@cluster0.aunvoxf.mongodb.net/?retryWrites=true&w=majority`,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
