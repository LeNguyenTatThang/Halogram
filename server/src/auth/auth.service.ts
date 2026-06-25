import { Injectable, BadRequestException } from '@nestjs/common';
import { UserTransformer } from '../common/transformers/user.transformer';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async login(dto: SignInDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      message: 'Login successful',
      accessToken,
      data: UserTransformer.transform(user),
    };
  }

  async signUp(dto: SignUpDto) {
    const existsUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existsUser) {
      throw new BadRequestException(
        existsUser.email === dto.email
          ? 'Email already exists'
          : 'Username already exists',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: await this.hashPassword(dto.password),
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

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return UserTransformer.transform(user);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
