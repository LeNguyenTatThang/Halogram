import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { SearchDto } from './dto/search.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getProfileById(user.id);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Param('username') username: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.getProfile(username, user.id);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(
    @Query() query: SearchDto,
    @Query('userId') userId: string,
  ) {
    const users = await this.usersService.searchUsers(
      query.keyword,
      userId,
      query.cursor,
    );
    return {
      success: true,
      message: 'Users fetched successfully',
      data: users,
    };
  }
}
