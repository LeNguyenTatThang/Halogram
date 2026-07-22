import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class FriendshipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getUsers(userId: string, friendId: string) {
    const [user, friend] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: friendId } }),
    ]);
    if (!user || !friend) {
      throw new NotFoundException('User not found');
    }

    return { user, friend };
  }

  async requestFriendship(userId: string, friendId: string) {
    await this.getUsers(userId, friendId);

    if (userId === friendId) {
      return {
        success: false,
        message: 'You cannot send a friend request to yourself',
      };
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            userId,
            friendId,
          },
          {
            userId: friendId,
            friendId: userId,
          },
        ],
      },
    });

    if (existing) {
      switch (existing.status) {
        case 'PENDING':
          return {
            success: false,
            message: 'Friend request already exists',
          };

        case 'ACCEPTED':
          return {
            success: false,
            message: 'Already friends',
          };

        case 'BLOCKED':
          return {
            success: false,
            message: 'Cannot send request',
          };
      }
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        userId,
        friendId,
      },
    });

    await this.notificationsService.createNotification({
      type: 'FRIEND_REQUEST',
      recipientId: friendId,
      actorId: userId,
    });

    return {
      success: true,
      message: 'Friend request sent successfully',
      data: friendship,
    };
  }

  async acceptFriendship(userId: string, friendId: string) {
    try {
      await this.getUsers(userId, friendId);

      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
              status: 'PENDING',
            },
            {
              userId: friendId,
              friendId: userId,
              status: 'PENDING',
            },
          ],
        },
      });

      if (!friendship) {
        return {
          success: false,
          message: 'Friend request not found',
        };
      }

      const updatedFriendship = await this.prisma.friendship.update({
        where: {
          id: friendship.id,
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      const originalRequesterId =
        friendship.userId === userId ? friendship.friendId : friendship.userId;

      await this.notificationsService.createNotification({
        type: 'FRIEND_ACCEPTED',
        recipientId: originalRequesterId,
        actorId: userId,
      });

      return {
        success: true,
        message: 'Friend request accepted',
        data: updatedFriendship,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async removeFriendship(userId: string, friendId: string) {
    try {
      await this.getUsers(userId, friendId);
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
            },
            {
              userId: friendId,
              friendId: userId,
            },
          ],
        },
      });

      if (!friendship) {
        return {
          success: false,
          message: 'Friendship not found',
        };
      }

      await this.prisma.friendship.deleteMany({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
            },
            {
              userId: friendId,
              friendId: userId,
            },
          ],
        },
      });

      return {
        success: true,
        message: 'Friendship removed successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async cancelFriendship(userId: string, friendId: string) {
    try {
      await this.getUsers(userId, friendId);

      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
              status: 'PENDING',
            },
            {
              userId: friendId,
              friendId: userId,
              status: 'PENDING',
            },
          ],
        },
      });

      if (!friendship) {
        return {
          success: false,
          message: 'Friend request not found',
        };
      }

      await this.prisma.friendship.deleteMany({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
              status: 'PENDING',
            },
            {
              userId: friendId,
              friendId: userId,
              status: 'PENDING',
            },
          ],
        },
      });

      return {
        success: true,
        message: 'Friend request canceled',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async blockFriendship(userId: string, friendId: string) {
    try {
      await this.getUsers(userId, friendId);

      const blockedFriendship = await this.prisma.friendship.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          friend: {
            connect: {
              id: friendId,
            },
          },
          status: 'BLOCKED',
        },
      });

      return {
        success: true,
        message: 'Friendship blocked successfully',
        data: blockedFriendship,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async unblockFriendship(userId: string, friendId: string) {
    try {
      await this.getUsers(userId, friendId);

      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
              status: 'BLOCKED',
            },
            {
              userId: friendId,
              friendId: userId,
              status: 'BLOCKED',
            },
          ],
        },
      });

      if (!friendship) {
        return {
          success: false,
          message: 'Friendship not found',
        };
      }

      const updatedFriendship = await this.prisma.friendship.deleteMany({
        where: {
          OR: [
            {
              userId: userId,
              friendId: friendId,
              status: 'BLOCKED',
            },
            {
              userId: friendId,
              friendId: userId,
              status: 'BLOCKED',
            },
          ],
        },
      });

      return {
        success: true,
        message: 'Friendship unblocked successfully',
        data: updatedFriendship,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getFriendshipRequests(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const friendshipRequests = await this.prisma.friendship.findMany({
        where: {
          friendId: userId,
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          friend: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Friendship requests fetched successfully',
        data: friendshipRequests,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getFriendships(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const friendships = await this.prisma.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ userId }, { friendId: userId }],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          friend: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      const data = friendships.map((friendship) => {
        const otherUser =
          friendship.userId === userId ? friendship.friend : friendship.user;

        return {
          id: friendship.id,
          status: friendship.status,
          createdAt: friendship.createdAt,
          updatedAt: friendship.updatedAt,
          friend: otherUser,
        };
      });

      return {
        success: true,
        message: 'Friendships fetched successfully',
        data,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
