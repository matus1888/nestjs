import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from 'src/common/guards';

@Module({
  imports: [
    // Подключаем TypeORM для работы с сущностью Post
    TypeOrmModule.forFeature([Post]),

    // Импортируем UserModule для доступа к пользователям
    UserModule,
  ],
  controllers: [PostController], // Регистрируем контроллер
  providers: [
    PostService, // Регистрируем сервис
    JwtAuthGuard, // Регистрируем защитник маршрутов
  ],
})
export class PostModule {}
