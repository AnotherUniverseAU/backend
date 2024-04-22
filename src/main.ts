import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './adapters/socket-io.adapters';
import { ValidationPipe } from '@nestjs/common';
import { winstonLogger } from './common/logger/winston.util';
import { LoggerMiddleware } from './common/logger/logger.middleware';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger, // More verbose logging
  });
  // app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips non-whitelisted properties
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert primitive types
      },
    }),
  );

  app.enableCors();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  // await app.listen(process.env.PORT || 3000);
  await app.listen(3000);
}
bootstrap();
