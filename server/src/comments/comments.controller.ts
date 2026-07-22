import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('create-comment')
  async createComment(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, dto.postId, dto.comment);
  }

  @Put('update-comment')
  async updateComment(
    @CurrentUser() user: JwtUser,
    @Body() body: { commentId: string; text: string },
  ) {
    return this.commentsService.updateComment(body.commentId, user.id, body.text);
  }

  @Delete(':id')
  async deleteComment(
    @CurrentUser() user: JwtUser,
    @Param('id') commentId: string,
  ) {
    return this.commentsService.deleteComment(commentId, user.id);
  }
}
