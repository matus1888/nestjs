import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard, RefreshTokenGuard } from 'src/common/guards';

export interface AuthRequestBody extends Request {
  user: {
    sub: string;
    email: string;
    refreshToken: string;
    password: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('iam')
  async iam(
    @Request() req: { headers: { authorization: string } },
    @Body() body: { mail: string },
  ) {
    return this.authService.iam(req.headers.authorization, body.mail);
  }
  /**
   * Вход в систему (получение access и refresh токенов)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: AuthRequestBody) {
    console.log(body.user);
    return this.authService.login(body.user);
  }

  /**
   * Обновление токенов (access и refresh)
   */
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: AuthRequestBody) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  /**
   * Выход из системы (например, добавление refresh токена в черный список)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: AuthRequestBody) {
    const userId = req.user.sub;
    return this.authService.logout(userId);
  }
}
