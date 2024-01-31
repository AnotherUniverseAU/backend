import { OauthDTO } from 'src/oauth/dto/oauth.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

export interface IUesrRepository {
  findByOauth(mode: string, id: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  createByOauth(mode: string, userInfo: OauthDTO): Promise<UserDocument>;
  findByUserId(userId: string): Promise<UserDocument>;
}
