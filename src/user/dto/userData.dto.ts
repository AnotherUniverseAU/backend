import { UserDocument } from 'src/schemas/user.schema';

export class userDataDTO {
  readonly id: string;
  readonly nickname: string;
  readonly oauthProvider: string[];
  constructor(user: UserDocument) {
    this.id = user._id.toString();
    this.nickname = user.nickname;
    this.oauthProvider = user.oauthAccounts.map((value) => {
      return value.provider;
    });
  }
}
