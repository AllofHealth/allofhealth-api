import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PORT } from './shared/data/constants';
import { MyLoggerService } from './modules/my-logger/service/my-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use custom logger globally
  app.useLogger(app.get(MyLoggerService));

  const config = new DocumentBuilder()
    .setTitle('AllofHealth API')
    .setDescription('The AllofHealth API description')
    .setVersion('1.0')
    .addTag('health')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
      'Authorization',
    )
    .build();

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);
}
bootstrap().catch((error) => {
  console.error(error);
});
