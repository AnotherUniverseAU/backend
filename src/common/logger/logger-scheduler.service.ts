import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { winstonLogger } from './winston.util';
import winston from 'winston/lib/winston/config';

@Injectable()
export class LoggerSchedulerService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  constructor(private configService: ConfigService) {
    this.containerName = this.configService.get<string>(
      'AZURE_STORAGE_LOG_CONTAINER_NAME',
    );
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
  }

  // 매일 1시마다 전날 로그 올리기 (영국 시간 기준 하루)
  @Cron('0 1 * * *')
  // 로거 5분마다 테스트
  // @Cron('*/5 * * * *')
  async uploadCache() {
    winstonLogger.log('uploading cache logs to azure');
    const yesterday = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const yesterdayLog = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate() - 1)}`;

    const yesterdayInfoLog = yesterdayLog + '.info.log';
    const yesterdayInfoLogDir = path.join(
      process.cwd(),
      'logs',
      yesterdayInfoLog,
    );
    const yesterdayWarningLog = yesterdayLog + '.warn.log';
    const yesterdayWarningLogDir = path.join(
      process.cwd(),
      'logs',
      yesterdayWarningLog,
    );
    const yesterdayErrorLog = yesterdayLog + '.error.log';
    const yesterdayErrorLogDir = path.join(
      process.cwd(),
      'logs',
      yesterdayErrorLog,
    );

    const readFile = util.promisify(fs.readFile);
    const InfoBuffer = await readFile(yesterdayInfoLogDir);
    const WarningBuffer = await readFile(yesterdayWarningLogDir);
    const ErrorBuffer = await readFile(yesterdayErrorLogDir);

    const containerClient = this.blobServiceClient.getContainerClient('logger');
    const infoBlobClient = containerClient.getBlockBlobClient(
      `logs/${yesterdayInfoLog}`,
    );
    await infoBlobClient.upload(InfoBuffer, InfoBuffer.length);

    const warningBlobClient = containerClient.getBlockBlobClient(
      `logs/${yesterdayWarningLog}`,
    );
    await warningBlobClient.upload(WarningBuffer, WarningBuffer.length);

    const errorBlobClient = containerClient.getBlockBlobClient(
      `logs/${yesterdayErrorLog}`,
    );
    await errorBlobClient.upload(ErrorBuffer, ErrorBuffer.length);

    winstonLogger.log('uploaded cache logs');
  }
}
