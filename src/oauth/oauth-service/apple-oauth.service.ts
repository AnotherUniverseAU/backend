import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { request } from 'http';
import { IOauth } from './ioauth.interface';
import { OauthDTO } from '../dto/oauth.dto';
import axios from 'axios';
import * as qs from 'qs';
import * as jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
// import jwt from 'jsonwebtoken';

@Injectable()
export class AppleOauthService {
  private APPLE_CLIENT_ID: string;
  private REDIRECT_URI: string;
  private APPLE_KEY_ID: string;
  private APPLE_TEAM_ID: string;
  private APPLE_PRIVATE_KEY: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.APPLE_CLIENT_ID = this.configService.get<string>('APPLE_CLIENT_ID');
    this.REDIRECT_URI = this.configService.get<string>('REDIRECT_URI');
    this.APPLE_KEY_ID = this.configService.get<string>('APPLE_KEY_ID');
    this.APPLE_TEAM_ID = this.configService.get<string>('APPLE_TEAM_ID');
    this.APPLE_PRIVATE_KEY =
      this.configService.get<string>('APPLE_PRIVATE_KEY');
  }
  async getJwt() {
    const algorithm = 'ES256';

    const claim_payload = {
      iss: this.APPLE_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      // 30일
      exp: Math.floor(Date.now() / 1000) + 2592000,
      aud: 'https://appleid.apple.com',
      sub: this.APPLE_CLIENT_ID,
    };

    const token = jwt.sign(
      claim_payload,
      this.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      {
        algorithm: algorithm,
        keyid: this.APPLE_KEY_ID,
      },
    );
    return token;
  }

  async getIdToken(code: string): Promise<string> {
    const jwtToken = await this.getJwt();

    const APPLE_URL = 'https://appleid.apple.com/auth/token';

    const response = await axios.post(
      APPLE_URL,
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        client_secret: jwtToken,
        client_id: this.APPLE_CLIENT_ID,
        redirect_uri: this.REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { id_token } = response.data;

    // return response;
    return id_token;
  }

  async decodeIdToken(id_token: string) {
    const decodedToken = jwtDecode(id_token);
    console.log(decodedToken);
    return decodedToken;
  }

  async getUserInfo(code: string) {
    const idToken = await this.getIdToken(code);
    const decodedToken = await this.decodeIdToken(idToken);
    const userId = decodedToken.sub;

    const userInfo = new OauthDTO(userId, '');
    return userInfo;
  }

  // async getUserInfo(code: string): Promise<OauthDTO> {
  //   console.log('obtaining user info');
  //   let access_token: string;
  //   try {
  //     access_token = await this.getAccessToken(code);
  //   } catch (err) {
  //     console.log(err);
  //     throw new Error(err);
  //   }
  //   const APPLE_USER_URL = 'https://appleid.apple.com/auth/authorize';
  //   const header = {
  //     Authorization: `Bearer ${access_token}`,
  //     'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
  //   };
  //   const response = await firstValueFrom(
  //     this.httpService.get(APPLE_USER_URL, { headers: header }),
  //   );

  //   const userInfo = this.extractUserInfo(response.data);

  //   return userInfo;
  // }

  // async getUserInfoWithAccessToken(access_token: string): Promise<OauthDTO> {
  //   const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me';
  //   const header = {
  //     Authorization: `Bearer ${access_token}`,
  //     'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
  //   };
  //   let response;
  //   try {
  //     response = await firstValueFrom(
  //       this.httpService.get(KAKAO_USER_URL, { headers: header }),
  //     );
  //   } catch (err) {
  //     console.log(err);
  //     throw new Error(err);
  //   }
  //   const userInfo = this.extractUserInfo(response.data);

  //   return userInfo;
  // }

  // extractUserInfo(data: any): OauthDTO {
  //   const { id, kakao_account } = data;
  //   // const { profile_nickname, email, phone_number, birthyear, gender } = kakao_account;
  //   const { profile } = kakao_account;
  //   // const phoneNum = phone_number.replace('+82 ', '0');
  //   const { nickname } = profile;
  //   // const age = this.calculateAge(birthyear);
  //   const userInfo = new OauthDTO(id, nickname);
  //   // const userInfo = new OauthDTO(id, nickname, email, phoneNum, age, gender);

  //   return userInfo;
  // }
}
