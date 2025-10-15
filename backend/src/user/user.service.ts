import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(userDto: CreateUserDto) {
    const newUser = this.userRepository.create(userDto);
    return this.userRepository.save(newUser);
  }

  async update(id: string, userDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, userDto);
    return this.userRepository.save(user);
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
