import { Injectable, BadRequestException } from '@nestjs/common';
import { IOauth } from './ioauth.interface';
import { KakaoOauthService } from './kakao-oauth.service';
import { AppleOauthService } from './apple-oauth.service';

@Injectable()
export class OauthServiceFactory {
  constructor(
    private kakaoOauthService: KakaoOauthService,
    private appleOauthService: AppleOauthService,
  ) {}

  getOauthService(mode: string): any {
    switch (mode) {
      case 'kakao':
        return this.kakaoOauthService;
      case 'apple':
        return this.appleOauthService;
      default:
        throw new BadRequestException('Invalid OAuth mode');
    }
  }
}
