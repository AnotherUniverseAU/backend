import { User, UserDocument } from 'src/schemas/user.schema';

export interface IOauthRepository {
  findByOauth(mode: string, id: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
}
