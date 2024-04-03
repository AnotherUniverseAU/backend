import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { request } from 'http';
import { IOauth } from './ioauth.interface';
import { OauthDTO } from '../dto/oauth.dto';

@Injectable()
export class KakaoOauthService implements IOauth {
  private KAKAO_CLIENT_ID: string;
  private REDIRECT_URI: string;
  private KAKAO_CLIENT_SECRET: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.KAKAO_CLIENT_ID = this.configService.get<string>('KAKAO_CLIENT_ID');
    this.REDIRECT_URI = `${this.configService.get<string>('BACKEND_URL')}/oauth/kakao`;
    this.KAKAO_CLIENT_SECRET = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET',
    );
  }

  async getAccessToken(code: string): Promise<string> {
    const KAKAO_URL = 'https://kauth.kakao.com/oauth/token';
    const body = {
      grant_type: 'authorization_code',
      client_id: this.KAKAO_CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      code: code,
      client_secret: this.KAKAO_CLIENT_SECRET,
    };

    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const response = await firstValueFrom(
      this.httpService.post(KAKAO_URL, body, { headers: header }),
    );

    const { access_token, refresh_token } = response.data;

    return access_token;
  }

  async getUserInfo(code: string): Promise<OauthDTO> {
    console.log('obtaining user info');
    let access_token: string;
    try {
      access_token = await this.getAccessToken(code);
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
    const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me';
    const header = {
      Authorization: `Bearer ${access_token}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const response = await firstValueFrom(
      this.httpService.get(KAKAO_USER_URL, { headers: header }),
    );

    const userInfo = this.extractUserInfo(response.data);

    return userInfo;
  }

  async getUserInfoWithAccessToken(access_token: string): Promise<OauthDTO> {
    const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me';
    const header = {
      Authorization: `Bearer ${access_token}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const response = await firstValueFrom(
      this.httpService.get(KAKAO_USER_URL, { headers: header }),
    );

    const userInfo = this.extractUserInfo(response.data);

    return userInfo;
  }

  extractUserInfo(data: any): OauthDTO {
    const { id, kakao_account } = data;
    const { profile, email, phone_number, birthyear, gender } = kakao_account;
    const phoneNum = phone_number.replace('+82 ', '0');
    const { nickname } = profile;
    const age = this.calculateAge(birthyear);
    const userInfo = new OauthDTO(id, nickname, email, phoneNum, age, gender);

    return userInfo;
  }

  calculateAge(birthyear: string): number {
    const currentYear = new Date().getFullYear();
    const birthyearInt = parseInt(birthyear, 10);
    const age = currentYear - birthyearInt;
    return age;
  }
}
