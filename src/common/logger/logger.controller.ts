import { BlobServiceClient } from '@azure/storage-blob';
import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { LoggerSchedulerService } from './logger-scheduler.service';
import { winstonLogger } from './winston.util';

@Controller('logger')
export class LoggerController {
  constructor(private loggerService: LoggerSchedulerService) {}

  @UseGuards(CommonJwtGuard)
  @Post('upload-today-logs')
  @HttpCode(200)
  async uploadTodayLogs() {
    winstonLogger.log('uploading today logs');
  }
}
