import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';
interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: SignInDto) {
    return this.authService.login(dto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthRequest) {
    console.log(req.user);
    return this.authService.getCurrentUser(req.user.id);
  }
}
