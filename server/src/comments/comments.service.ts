import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  async createComment(postId: string, userId: string, comment: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error('Post not found');
      }
      if (!comment) {
        throw new Error('Comment cannot be empty');
      }

      const newComment = await this.prisma.comment.create({
        data: {
          userId,
          postId,
          text: comment,
        },
      });

      return {
        success: true,
        message: 'Comment created successfully',
        data: newComment,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateComment(commentId: string, userId: string, text: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new Error('You are not authorized to update this comment');
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
    } catch (error) {
      console.log(error);
    }
  }

  async deleteComment(commentId: string, userId: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new Error(' You are not authorized to delete this comment');
      }

      await this.prisma.comment.delete({
        where: { id: commentId },
      });

      return {
        success: true,
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCommentByAuthor(postId: string, userId: string) {
    try {
      const comments = await this.prisma.comment.findMany({
        where: { postId, userId },
      });

      if (!comments) {
        throw new Error('Comments not found');
      }

      await this.prisma.comment.deleteMany({
        where: { postId, userId },
      });

      return {
        success: true,
        message: 'Comments deleted successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async listComment(postId: string) {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }
}
