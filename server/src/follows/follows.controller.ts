import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follow')
  async follow(
    @CurrentUser() user: JwtUser,
    @Body() dto: { followingId: string },
  ) {
    return this.followsService.follow(user.id, dto.followingId);
  }

  @Delete('unfollow')
  async unfollow(
    @CurrentUser() user: JwtUser,
    @Body() dto: { followingId: string },
  ) {
    return this.followsService.unfollow(user.id, dto.followingId);
  }
}
