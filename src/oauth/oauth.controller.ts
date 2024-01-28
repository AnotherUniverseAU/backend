import { Controller, Get, Param, Query, Res, UseFilters } from '@nestjs/common';
import { IOauth } from './oauth-service/ioauth.interface';
import { OauthServiceFactory } from './oauth-service/oauth-service.factory';
import { HttpExceptionFilter } from 'src/filters/http-exception-filter.filter';
import { CommonOauthService } from './oauth-service/common-oauth.service';
import { Response } from 'express';
//https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=363694240e1bf53fb3ef28532803be8d&redirect_uri=http://127.0.0.1:3000/oauth/kakao
//redirect_uri=127.0.0.1:3000/oauth/kakao

@Controller('oauth')
// @UseFilters(new HttpExceptionFilter())
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

    console.log(userInfo.id);
    const newUser = await this.commonOauthService.findOrCreate(
      mode,
      userInfo.id,
    );

    if (newUser.new) {
      return response
        .status(201)
        .json({ isNew: true, id: newUser.userData._id });
    } else {
      const loginCredential = await this.commonOauthService.getUserCredentials(
        newUser.userData,
      );

      return response.status(200).json(loginCredential);
    }
  }
}
