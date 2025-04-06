import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { JwtAccessStrategy } from './strategies/jwt-access.stratergy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.stratergy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // Подключаем PassportModule для работы с аутентификацией
    PassportModule.register({ defaultStrategy: 'jwt-access' }),

    // Настройка JwtModule для генерации токенов
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_ACCESS_SECRET, // Секретный ключ для access токена
        signOptions: { expiresIn: '15m' }, // Время жизни access токена
      }),
    }),

    // Импортируем UserModule для работы с пользователями
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController], // Регистрируем контроллер
  providers: [
    AuthService, // Регистрируем сервис
    JwtAccessStrategy, // Регистрируем стратегию для access токена
    JwtRefreshStrategy, // Регистрируем стратегию для refresh токена
    UserService, // Регистрируем сервис пользователей
  ],
  exports: [AuthService], // Экспортируем AuthService для использования в других модулях
})
export class AuthModule {}
