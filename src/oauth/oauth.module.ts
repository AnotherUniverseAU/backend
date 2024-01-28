import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KakaoOauthService } from './oauth-service/kakao-oauth.service';
import { OauthController } from './oauth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OauthServiceFactory } from './oauth-service/oauth-service.factory';
import { JwtModule } from '@nestjs/jwt';
import { CommonOauthService } from './oauth-service/common-oauth.service';
import { OauthRepository } from './repository/oauth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '60m' }, // Example expiration time for access tokens
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://newxxson:${configService.get<string>('MONGO_DB_PWD')}@cluster0.aunvoxf.mongodb.net/?retryWrites=true&w=majority`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [OauthController],
  providers: [
    KakaoOauthService,
    OauthRepository,
    OauthServiceFactory,
    CommonOauthService,
  ],
})
export class OauthModule {}
