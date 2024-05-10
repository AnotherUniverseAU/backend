import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import { IOauth } from './oauth-service/ioauth.interface';
import { OauthServiceFactory } from './oauth-service/oauth-service.factory';
import { HttpExceptionFilter } from 'src/filters/http-exception-filter.filter';
import { CommonOauthService } from './oauth-service/common-oauth.service';
import { Response } from 'express';
import axios from 'axios';
import { Strategy as AppleStrategy } from 'passport-apple';
import { PassportModule } from '@nestjs/passport';
import passport from 'passport';

@Controller('oauth')
export class OauthController {
  private oauthService: IOauth;
  constructor(
    private oauthServiceFactory: OauthServiceFactory,
    private commonOauthService: CommonOauthService,
  ) {}
  // @Get(':mode')
  // async oauth(
  //   @Res() response: Response,
  //   @Param('mode') mode: string,
  //   @Query('code') code: string,
  //   @Query('error') error?: string,
  // ) {
  //   if (error) {
  //     console.log('error at kakao level');
  //     throw new Error(error);
  //   }

  //   console.log(code);
  //   return response.status(200).json({ code });

  //   //get corresponding oauth service with the mode
  //   this.oauthService = this.oauthServiceFactory.getOauthService(mode);
  //   const userInfo = await this.oauthService.getUserInfo(code);
  //   const user = await this.commonOauthService.findOrCreate(mode, userInfo);
  //   console.log('adsf', user._id);
  //   const loginCredential =
  //     await this.commonOauthService.getUserCredentials(user);

  //   return response.status(200).json(loginCredential);
  // }

  @Post(':mode')
  async oauthLogin(
    @Res() response: Response,
    @Param('mode') mode: string,
    @Body('code') code: string,
  ) {
    this.oauthService = this.oauthServiceFactory.getOauthService(mode);

    const userInfo = await this.oauthService.getUserInfo(code);
    const user = await this.commonOauthService.findOrCreate(mode, userInfo);
    const loginCredential =
      await this.commonOauthService.getUserCredentials(user);

    return response.status(200).json(loginCredential);
  }
}
