import { Body, Controller, Delete, Post, Put, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('create-comment')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, dto.postId, dto.comment);
  }

  @Put('update-comment')
  async updateComment(postId: string, userId: string, text: string) {
    return this.commentsService.updateComment(postId, userId, text);
  }

  @Delete('delete-comment-user')
  async deleteComment(postId: string, userId: string) {
    return this.commentsService.deleteComment(postId, userId);
  }

  @Delete('delete-comment-by-author')
  async deleteCommentByAuthor(postId: string, userId: string) {
    return this.commentsService.deleteCommentByAuthor(postId, userId);
  }
}
