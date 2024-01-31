import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/repository/user.repository';
import { ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SignupGuard implements CanActivate {
  private SIGNUP_TOKEN_SECRET: string;
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private configService: ConfigService,
    private userRepo: UserRepository,
  ) {
    this.SIGNUP_TOKEN_SECRET = configService.get<string>('SIGNUP_TOKEN_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      request.user = null;
      return true;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer != 'Bearer' || !token)
      throw new UnauthorizedException('Invalid token format');

    try {
      const payload = await this.authService.verifyToken('signup', token);
      const id = payload['sub'];
      const user = await this.userRepo.findById(id);

      if (user) {
        request.user = user;
        return true;
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
