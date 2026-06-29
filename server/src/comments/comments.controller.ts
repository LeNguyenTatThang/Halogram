import { Controller, Delete, Post, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('create-comment')
  async createComment(postId: string, userId: string, comment: string) {
    return this.commentsService.createComment(postId, userId, comment);
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
