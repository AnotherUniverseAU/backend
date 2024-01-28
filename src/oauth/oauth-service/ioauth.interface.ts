import { OauthDTO } from '../dto/oauth.dto';

export interface IOauth {
  getAccessToken(code: string): Promise<string>;
  getUserInfo(code: string): Promise<OauthDTO>;
}
