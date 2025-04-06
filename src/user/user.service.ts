import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Поиск пользователя по email
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Создание нового пользователя
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const newUser = this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
    });
    return this.userRepository.save(newUser);
  }

  /**
   * Поиск пользователя по ID
   */
  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Инвалидация refresh токена
   */
  async invalidateRefreshToken(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    user.refreshToken = null; // Очищаем refresh токен
    await this.userRepository.save(user);
  }

  /**
   * Получение данных профиля
   */
  async getProfile(userId: string): Promise<User> {
    return this.findOneById(userId);
  }

  /**
   * Обновление данных профиля
   */
  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOneById(userId);
    const nUser = { ...user };
    const { about, phone, birthday, firstName, lastName } = updateUserDto;

    if (updateUserDto.email) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
      nUser.email = updateUserDto.email;
    }

    nUser.about = about;
    nUser.phone = phone;
    nUser.birthday = birthday;
    nUser.firstName = firstName;
    nUser.lastName = lastName;

    //TODO
    // if (updateUserDto.password) {
    //   const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    //   user.password = hashedPassword;
    // }

    await this.userRepository.save(nUser);
    const res = await this.findOneById(userId);
    return res;
  }

  /**
   * Загрузка аватара
   */
  async uploadAvatar(userId: string, avatarFilename: string): Promise<User> {
    const user = await this.findOneById(userId);

    // Удаляем старый аватар, если он существует
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = avatarFilename;
    return this.userRepository.save(user);
  }
}
