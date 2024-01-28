import { UserDocument } from 'src/schemas/user.schema';

export class NewUserDTO {
  private isNew: boolean;
  private user: UserDocument;
  constructor(isNew: boolean, user: UserDocument) {
    this.isNew = isNew;
    this.user = user;
  }

  get new() {
    return this.isNew;
  }

  get userData() {
    return this.user;
  }

  toJSON() {
    return {
      isNew: this.isNew,
      user: this.user,
    };
  }
}
