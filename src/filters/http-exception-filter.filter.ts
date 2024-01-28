import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = 500;
    let message = 'Internal server error???';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      //@ts-ignore
      message = exception.getResponse();
    } else if (
      exception instanceof Error &&
      (exception as AxiosError).isAxiosError
    ) {
      const axiosError = exception as AxiosError;
      if (axiosError.response) {
        status = axiosError.response.status;
        //@ts-ignore
        message = axiosError.response.data;
      }
    }

    console.error('Error status: ', status, 'Error message: ', message);

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
