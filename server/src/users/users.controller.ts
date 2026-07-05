import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchDto } from './dto/search.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
