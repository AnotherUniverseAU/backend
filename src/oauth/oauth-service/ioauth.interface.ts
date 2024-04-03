import { OauthDTO } from '../dto/oauth.dto';

export interface IOauth {
  getAccessToken(code: string): Promise<string>;
  getUserInfo(code: string): Promise<OauthDTO>;
  getUserInfoWithAccessToken(token: string): Promise<OauthDTO>;
}
