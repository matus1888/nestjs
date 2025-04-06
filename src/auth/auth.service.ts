import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const dbUser = await this.userService.findOneByEmail(email);
    if (!dbUser) {
      return null;
    }
    const isValid = await bcrypt.compare(password, dbUser.password);
    if (isValid) {
      return dbUser;
    }
    return null;
  }

  async register(createUserDto: { email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return { ...user, password: undefined };
  }

  async iam(token: string, email: string) {
    const isValidToken = this.jwtService.verify(token.split(' ')?.[1]); // delete 'Bearer'
    if (isValidToken) {
      return this.userService.findOneByEmail(email);
    }
  }

  async login(user: { email: string; password: string }) {
    const { email, password } = user;
    const validUser = await this.validateUser(email, password);
    console.log(validUser);
    if (validUser) {
      const payload = { sub: validUser.id, email: validUser.email };
      return {
        user: { ...validUser, password: undefined },
        access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      };
    }
    throw new HttpException('no valid data', 404);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findOneById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }
    return this.login(user);
  }

  async logout(userId: string) {
    // Например, добавляем refresh токен в черный список
    return this.userService.invalidateRefreshToken(userId);
  }
}
