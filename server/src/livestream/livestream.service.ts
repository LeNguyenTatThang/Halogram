import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateLivestreamDto } from './dto/create-livestream.dto';

@Injectable()
export class LivestreamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateLivestreamDto) {
    return this.prisma.livestream.create({
      data: {
        streamerId: userId,
        title: dto.title,
        status: 'LIVE',
      },
      include: {
        streamer: {
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
  }

  async getActive() {
    return this.prisma.livestream.findMany({
      where: { status: 'LIVE' },
      orderBy: { startedAt: 'desc' },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async getById(id: string) {
    const livestream = await this.prisma.livestream.findUnique({
      where: { id },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
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
        },
      },
    });

    if (!livestream) {
      throw new NotFoundException('Livestream not found');
    }

    return livestream;
  }

  async endStream(id: string, userId: string) {
    const livestream = await this.prisma.livestream.findUnique({
      where: { id },
    });

    if (!livestream) {
      throw new NotFoundException('Livestream not found');
    }

    if (livestream.streamerId !== userId) {
      throw new ForbiddenException('Only the streamer can end this livestream');
    }

    return this.prisma.livestream.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });
  }

  async addMessage(livestreamId: string, userId: string, content: string) {
    return this.prisma.livestreamMessage.create({
      data: {
        livestreamId,
        userId,
        content,
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
  }

  async getMessages(livestreamId: string, skip = 0, take = 50) {
    return this.prisma.livestreamMessage.findMany({
      where: { livestreamId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
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
  }

  async incrementViewerCount(id: string) {
    return this.prisma.livestream.update({
      where: { id },
      data: { viewerCount: { increment: 1 } },
    });
  }

  async decrementViewerCount(id: string) {
    return this.prisma.livestream.update({
      where: { id },
      data: { viewerCount: { decrement: 1 } },
    });
  }
}
