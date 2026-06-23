import { Injectable } from '@nestjs/common';
import { UserTransformer } from '../common/transformers/user.transformer';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  // eslint-disable-next-line @typescript-eslint/require-await
  async login() {
    const user = {
      id: 1,
      username: 'john_doe',
      email: 'johndoe@example.com',
      password: '123456',
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Just a regular guy who loves photography and travel.',
    };
    return {
      message: 'Login successful',
      data: UserTransformer.transform(user),
    };
  }

  async signUp(dto: SignUpDto) {
    const existsUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existsUser) {
      throw new Error('Email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: dto.password,
        displayName: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    return {
      message: 'Sign up successful',
      data: UserTransformer.transform(user),
    };
  }
}
