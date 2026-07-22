import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}
  async createComment(userId: string, postId: string, comment: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (!comment.trim()) {
      throw new BadRequestException('Comment cannot be empty');
    }

    const newComment = await this.prisma.comment.create({
      data: {
        userId,
        postId,
        text: comment,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    if (post.userId !== userId) {
      await this.notificationsService.createNotification({
        type: 'POST_COMMENT',
        recipientId: post.userId,
        actorId: userId,
        postId,
        commentId: newComment.id,
      });
    }

    return {
      success: true,
      message: 'Comment created successfully',
      data: newComment,
    };
  }

  async updateComment(commentId: string, userId: string, text: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this comment');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        text: text,
      },
    });

    return {
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this comment');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }

  async deleteCommentByAuthor(postId: string, userId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId, userId },
    });

    if (!comments) {
      throw new NotFoundException('Comments not found');
    }

    await this.prisma.comment.deleteMany({
      where: { postId, userId },
    });

    return {
      success: true,
      message: 'Comments deleted successfully',
    };
  }

  async listComment(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
    return comments;
  }
}
