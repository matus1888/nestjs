import {
  Controller,
  Get,
  Patch,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/common/guards';

interface ProfileReqBody extends Request {
  user: {
    sub: string;
  };
}

@Controller('profile')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Получение данных профиля текущего пользователя
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Request() req: ProfileReqBody) {
    const userId = req.user.sub;
    return this.userService.getProfile(userId);
  }

  /**
   * Обновление данных профиля
   */
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(@Body() updateUserDto: UpdateUserDto) {
    const userId = updateUserDto.id;
    return this.userService.updateProfile(userId, updateUserDto);
  }

  /**
   * Загрузка аватара
   */
  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `avatar-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ProfileReqBody,
  ) {
    const userId = req.user.sub;
    return this.userService.uploadAvatar(userId, file.filename);
  }
}
