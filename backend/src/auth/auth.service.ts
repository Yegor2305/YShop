import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { IUser } from './types/types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordsMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordsMatching)
      throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async register({ email, password }: CreateUserDto) {
    const existingUser = await this.userService.findUserByEmail(email);

    if (existingUser) throw new BadRequestException('User already exists');

    const encryptedPassword = await bcrypt.hash(
      password,
      this.configService.get('BCRYPT_SALT'),
    );

    const newUser = await this.userService.create({
      email,
      password: encryptedPassword,
    });

    return {
      email: newUser.email,
      accessToken: this.jwtService.sign({ email: newUser.email }),
    };
  }

  async login(user: IUser) {
    return {
      email: user.email,
      accessToken: this.jwtService.sign({ username: user.email }),
    };
  }
}
