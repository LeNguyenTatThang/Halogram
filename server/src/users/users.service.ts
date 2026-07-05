import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(
    keyword: string | undefined,
    userId: string,
    cursor?: string,
  ) {
    if (!keyword?.trim()) {
      return {
        users: [],
        nextCursor: null,
      };
    }

    const take = 10;

    const users = await this.prisma.user.findMany({
      where: {
        NOT: {
          id: userId,
        },
        OR: [
          { username: { contains: keyword } },
          { displayName: { contains: keyword } },
          { email: { contains: keyword } },
        ],
      },

      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,

      skip: cursor ? 1 : 0,

      take: take + 1,

      orderBy: {
        id: 'asc',
      },

      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,

        sentRequests: {
          where: {
            friendId: userId,
          },
          select: {
            status: true,
          },
        },

        received: {
          where: {
            userId: userId,
          },
          select: {
            status: true,
          },
        },
      },
    });

    const hasMore = users.length > take;

    const result = users.slice(0, take).map((user) => {
      let friendshipStatus: 'NONE' | 'PENDING' | 'FRIENDS' = 'NONE';

      const request = user.sentRequests[0] ?? user.received[0];

      if (request) {
        friendshipStatus =
          request.status === 'ACCEPTED' ? 'FRIENDS' : 'PENDING';
      }

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        friendshipStatus,
      };
    });

    return {
      users: result,
      nextCursor: hasMore ? result[result.length - 1].id : null,
    };
  }
}
