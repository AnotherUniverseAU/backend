import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

@Catch(UnauthorizedException)
export class JwtExpriedFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.message === 'Unauthorized') {
      response
        .status(HttpStatus.UNAUTHORIZED)
        .json({
          statusCode: HttpStatus.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
          message: 'Token expired',
        });
    }
  }
}
