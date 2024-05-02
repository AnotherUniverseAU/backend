import { BlobServiceClient } from '@azure/storage-blob';
import {
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { LoggerSchedulerService } from './logger-scheduler.service';
import { winstonLogger } from './winston.util';
import { Request } from 'express';

@Controller('logger')
export class LoggerController {
  constructor(private loggerService: LoggerSchedulerService) {}

  @UseGuards(CommonJwtGuard)
  @Post('upload-today-logs')
  @HttpCode(200)
  async uploadTodayLogs(@Req() req: Request) {
    const user = req.user;
    if (user.role !== 'admin') {
      winstonLogger.log('unauthorized access to upload logs');
      throw new UnauthorizedException();
    }
    winstonLogger.log('uploading today logs');
    this.loggerService.uploadCache();

    return 'good';
  }
}
