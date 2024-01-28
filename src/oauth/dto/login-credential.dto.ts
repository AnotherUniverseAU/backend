export class LoginCredentialDTO {
  private access_token: string;
  private refresh_token: string;
  constructor(access_token: string, refresh_token: string) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }

  toJSON() {
    return {
      access_token: this.access_token,
      refresh_token: this.refresh_token,
    };
  }
}
