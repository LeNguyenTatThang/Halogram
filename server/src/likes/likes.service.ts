import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}
  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.postLike.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      let liked: boolean;

      if (existingLike) {
        await tx.postLike.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });

        liked = false;
      } else {
        await tx.postLike.create({
          data: {
            userId,
            postId,
          },
        });

        liked = true;
      }

      const count = await tx.postLike.count({
        where: { postId },
      });

      return {
        liked,
        count,
      };
    });

    if (result.liked && post.userId !== userId) {
      await this.notificationsService.createNotification({
        type: 'POST_LIKE',
        recipientId: post.userId,
        actorId: userId,
        postId,
      });
    }

    return result;
  }
}
