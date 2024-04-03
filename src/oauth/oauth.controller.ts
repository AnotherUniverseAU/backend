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
//https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=3603e8c93211d595361b3cc334f4940a&redirect_uri=http://127.0.0.1:3000/oauth/kakao
//redirect_uri=127.0.0.1:3000/oauth/kakao

@Controller('oauth')
export class OauthController {
  private oauthService: IOauth;
  constructor(
    private oauthServiceFactory: OauthServiceFactory,
    private commonOauthService: CommonOauthService,
  ) {}
  @Get(':mode')
  async oauth(
    @Res() response: Response,
    @Param('mode') mode: string,
    @Query('code') code: string,
    @Query('error') error?: string,
  ) {
    if (error) {
      console.log('error at kakao level');
      throw new Error(error);
    }

    //get corresponding oauth service with the mode
    this.oauthService = this.oauthServiceFactory.getOauthService(mode);
    const userInfo = await this.oauthService.getUserInfo(code);
    const user = await this.commonOauthService.findOrCreate(mode, userInfo);
    console.log('adsf', user._id);
    const loginCredential =
      await this.commonOauthService.getUserCredentials(user);

    return response.status(200).json(loginCredential);
  }

  @Post(':mode')
  async oauthLogin(
    @Res() response: Response,
    @Body('mode') mode: string,
    @Body('access_token') access_token: string,
  ) {
    const userInfo =
      await this.oauthService.getUserInfoWithAccessToken(access_token);
    const user = await this.commonOauthService.findOrCreate(mode, userInfo);
    const loginCredential =
      await this.commonOauthService.getUserCredentials(user);

    return response.status(200).json(loginCredential);
  }
}
