import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { OauthModule } from './oauth/oauth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-filter';
@Module({
  imports: [
    OauthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
