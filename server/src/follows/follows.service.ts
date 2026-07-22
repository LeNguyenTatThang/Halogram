import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      return {
        success: false,
        message: 'You cannot follow yourself',
      };
    }

    const followingUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        message: 'Already following this user',
      };
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    await this.notificationsService.createNotification({
      type: 'FOLLOW',
      recipientId: followingId,
      actorId: followerId,
    });

    return {
      success: true,
      message: 'Followed successfully',
    };
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        message: 'Not following this user',
      };
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return {
      success: true,
      message: 'Unfollowed successfully',
    };
  }
}
