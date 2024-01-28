import { Injectable, BadRequestException } from '@nestjs/common';
import { IOauth } from './ioauth.interface';
import { KakaoOauthService } from './kakao-oauth.service';

@Injectable()
export class OauthServiceFactory {
  constructor(private kakaoOauthService: KakaoOauthService) {}

  getOauthService(mode: string): IOauth {
    switch (mode) {
      case 'kakao':
        return this.kakaoOauthService;
      default:
        throw new BadRequestException('Invalid OAuth mode');
    }
  }
}
