import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import type { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(params: {
    type: NotificationType;
    recipientId: string;
    actorId: string;
    postId?: string | null;
    commentId?: string | null;
  }) {
    const { type, recipientId, actorId, postId, commentId } = params;

    if (actorId === recipientId) return null;

    if (type === 'POST_LIKE' || type === 'POST_COMMENT') {
      const existing = await this.prisma.notification.findFirst({
        where: {
          type,
          actorId,
          recipientId,
          postId,
          isRead: false,
        },
      });
      if (existing) return existing;
    }

    const notification = await this.prisma.notification.create({
      data: {
        type,
        recipientId,
        actorId,
        postId,
        commentId,
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    const payload = {
      id: notification.id,
      type: notification.type,
      actor: notification.actor,
      postId: notification.postId,
      commentId: notification.commentId,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };

    this.notificationsGateway.emitNotification(recipientId, payload);

    return notification;
  }

  async getNotifications(userId: string, cursor?: string, limit = 20) {
    const where: Record<string, unknown> = { recipientId: userId };

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = notifications.length > limit;
    if (hasMore) notifications.pop();

    const nextCursor =
      hasMore && notifications.length > 0
        ? notifications[notifications.length - 1].createdAt.toISOString()
        : null;

    return {
      data: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        actor: n.actor,
        postId: n.postId,
        commentId: n.commentId,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.recipientId !== userId) return null;

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
