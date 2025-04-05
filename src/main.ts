import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //TODO enable ghpage for my appllication
    origin: '*', // Разрешённые домены
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Разрешённые HTTP-методы
    allowedHeaders: 'Content-Type, Authorization', // Разрешённые заголовки
    credentials: true, // Разрешить отправку куки и заголовков авторизации
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
