import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  if (!JSON.parse(configService.get('USE_NEST_LOGGER'))) {
    app.useLogger(
      WinstonModule.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: { service: 'ai-bees' },
        exitOnError: false,
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'logs/logs.log',
          }),
        ],
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('AI Bees')
    .setDescription('The AI Bees API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api/v1');
  await app.listen(configService.get('PORT'));
}
bootstrap();
