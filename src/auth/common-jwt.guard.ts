import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CommonJwtGuard extends AuthGuard('common-jwt') {}
