import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkMember(conversationId: string, userId: string) {
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    return member;
  }

  async createConversation(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new ForbiddenException(
        'You cannot create a conversation with yourself',
      );
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                userId,
              },
            },
          },
          {
            members: {
              some: {
                userId: friendId,
              },
            },
          },
          {
            members: {
              every: {
                userId: {
                  in: [userId, friendId],
                },
              },
            },
          },
        ],
      },
      include: {
        members: true,
      },
    });

    if (existing) {
      return existing;
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        members: {
          create: [
            {
              userId,
            },
            {
              userId: friendId,
            },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },

      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        },

        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            image: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });
  }

  async createMessage(userId: string, dto: CreateMessageDto) {
    await this.checkMember(userId, dto.conversationId);

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: userId,
        content: dto.content,
        image: dto.image,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    await this.prisma.conversation.update({
      where: {
        id: dto.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    limit: number,
    cursor?: string,
  ) {
    await this.checkMember(userId, conversationId);
    return await this.prisma.message.findMany({
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),

      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });
  }
}
