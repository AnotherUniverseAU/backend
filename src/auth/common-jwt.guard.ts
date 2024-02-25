import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class CommonJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [authType, token] = request.headers.authorization.split(' ');

    if (authType !== 'Bearer' || !token) {
      return false;
    } else {
      const result = await this.authService.verifyToken('access', token);
      const user = await this.authService.getUser(result.sub);
      request.user = user;
      return true;
    }
  }
}
