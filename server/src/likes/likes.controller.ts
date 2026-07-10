import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle-like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @CurrentUser() user: JwtUser,
    @Body() body: { postId: string },
  ) {
    return this.likesService.toggleLike(user.id, body.postId);
  }
}
