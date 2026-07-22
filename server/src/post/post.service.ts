import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getUserPosts(
    viewerId: string,
    targetUserId: string,
    cursor?: string,
    limit = 12,
  ) {
    const getPosts = await this.prisma.post.findMany({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId: viewerId },
          select: { userId: true },
        },
        images: true,
        tags: {
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
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const nextCursor =
      getPosts.length === limit ? getPosts[getPosts.length - 1].id : null;

    const posts = getPosts.map(({ likes, ...post }) => ({
      ...post,
      isLiked: likes.length > 0,
    }));

    return {
      success: true,
      posts,
      nextCursor,
    };
  }

  async getSavedPosts(userId: string, cursor?: string, limit = 12) {
    const cursorParts = cursor?.split('_');
    const cursorCondition =
      cursor && cursorParts?.length === 2
        ? { userId_postId: { userId: cursorParts[0], postId: cursorParts[1] } }
        : undefined;

    const savedPosts = await this.prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
            likes: {
              where: { userId },
              select: { userId: true },
            },
            savedBy: {
              where: { userId },
              select: { userId: true },
            },
            images: true,
            tags: {
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
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursorCondition && { cursor: cursorCondition, skip: 1 }),
    });

    const nextCursor =
      savedPosts.length === limit
        ? `${savedPosts[savedPosts.length - 1].userId}_${savedPosts[savedPosts.length - 1].postId}`
        : null;

    const mappedSaved = savedPosts.map(({ post }): Record<string, unknown> => {
      const { likes, savedBy, ...rest } = post;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...rest,
        isLiked: likes.length > 0,
        isSaved: savedBy.length > 0,
      };
    });

    return {
      success: true,
      posts: mappedSaved,
      nextCursor,
    };
  }

  async toggleSavePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.savedPost.delete({
        where: { userId_postId: { userId, postId } },
      });
      return { success: true, saved: false, message: 'Post unsaved' };
    }

    await this.prisma.savedPost.create({
      data: { userId, postId },
    });
    return { success: true, saved: true, message: 'Post saved' };
  }

  async getTaggedPosts(
    viewerId: string,
    targetUserId: string,
    cursor?: string,
    limit = 12,
  ) {
    const tagRecords = await this.prisma.postTag.findMany({
      where: { userId: targetUserId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
            likes: {
              where: { userId: viewerId },
              select: { userId: true },
            },
            images: true,
            tags: {
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
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const nextCursor =
      tagRecords.length === limit ? tagRecords[tagRecords.length - 1].id : null;

    const taggedPosts = tagRecords.map(({ post }): Record<string, unknown> => {
      const { likes, ...rest } = post;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return { ...rest, isLiked: likes.length > 0 };
    });

    return {
      success: true,
      posts: taggedPosts,
      nextCursor,
    };
  }

  private async validateTagUsers(userId: string, tagUserIds: string[]) {
    if (tagUserIds.includes(userId)) {
      throw new BadRequestException('Cannot tag yourself');
    }

    const uniqueIds = [...new Set(tagUserIds)];
    if (uniqueIds.length !== tagUserIds.length) {
      throw new BadRequestException('Duplicate tag user IDs');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    if (users.length !== uniqueIds.length) {
      throw new BadRequestException('One or more tagged users not found');
    }

    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: uniqueIds.map((id) => ({
          OR: [
            { userId, friendId: id },
            { userId: id, friendId: userId },
          ],
        })),
      },
      select: { userId: true, friendId: true },
    });

    const friendIds = new Set(
      friendships.map((f) => (f.userId === userId ? f.friendId : f.userId)),
    );

    const nonFriends = uniqueIds.filter((id) => !friendIds.has(id));
    if (nonFriends.length > 0) {
      throw new BadRequestException(
        `Not friends with user(s): ${nonFriends.join(', ')}`,
      );
    }
  }

  async createPost(data: {
    caption?: string;
    userId: string;
    files?: Express.Multer.File[];
    tagUserIds?: string[];
  }) {
    try {
      if (!data.caption?.trim() && (!data.files || data.files.length === 0)) {
        throw new Error('Post must have a caption or an image');
      }

      if (data.tagUserIds?.length) {
        await this.validateTagUsers(data.userId, data.tagUserIds);
      }

      const imageUrls = data.files?.length
        ? await this.cloudinaryService.uploadImages(
            data.files,
            'halogram/posts',
          )
        : [];

      const post = await this.prisma.post.create({
        data: {
          caption: data.caption,
          userId: data.userId,
          images: {
            create: imageUrls.map((url) => ({
              url,
            })),
          },
          tags: data.tagUserIds?.length
            ? {
                create: data.tagUserIds.map((tagUserId) => ({
                  userId: tagUserId,
                })),
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          images: true,
          tags: {
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
          },
        },
      });

      if (data.tagUserIds?.length) {
        await Promise.all(
          data.tagUserIds.map(async (tagUserId) => {
            await this.notificationsService.createNotification({
              type: 'POST_TAGGED',
              recipientId: tagUserId,
              actorId: data.userId,
              postId: post.id,
            });
          }),
        );
      }

      return {
        success: true,
        post,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePost(data: {
    postId: string;
    caption?: string;
    userId: string;
    files?: Express.Multer.File[];
    tagUserIds?: string[];
  }) {
    const post = await this.prisma.post.findFirst({
      where: { id: data.postId },
      include: { images: true, tags: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== data.userId) {
      throw new ForbiddenException(
        'You are not authorized to update this post',
      );
    }

    const imageURLs = data.files?.length
      ? await this.cloudinaryService.uploadImages(data.files, 'halogram/posts')
      : [];

    if (data.tagUserIds) {
      await this.validateTagUsers(data.userId, data.tagUserIds);

      const existingTagUserIds: string[] = (post.tags ?? []).map(
        (t: { userId: string }) => t.userId,
      );
      const newTagUserIds = data.tagUserIds.filter(
        (id: string) => !existingTagUserIds.includes(id),
      );
      const removedTagUserIds = existingTagUserIds.filter(
        (id: string) => !(data.tagUserIds as string[]).includes(id),
      );

      await Promise.all([
        removedTagUserIds.length > 0
          ? this.prisma.postTag.deleteMany({
              where: {
                postId: data.postId,
                userId: { in: removedTagUserIds },
              },
            })
          : Promise.resolve(),
        newTagUserIds.length > 0
          ? this.prisma.postTag.createMany({
              data: newTagUserIds.map((id) => ({
                postId: data.postId,
                userId: id,
              })),
            })
          : Promise.resolve(),
      ]);

      if (newTagUserIds.length > 0) {
        await Promise.all(
          newTagUserIds.map(async (tagUserId) => {
            await this.notificationsService.createNotification({
              type: 'POST_TAGGED',
              recipientId: tagUserId,
              actorId: data.userId,
              postId: data.postId,
            });
          }),
        );
      }
    }

    const updatePost = await this.prisma.post.update({
      where: { id: data.postId },
      data: {
        caption: data.caption,
        images: {
          create: imageURLs.map((url) => ({
            url,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        images: true,
        tags: {
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
        },
      },
    });

    return {
      success: true,
      post: updatePost,
    };
  }

  async listPost(userId: string, cursor?: string, limit = 10) {
    const friends = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId }, { friendId: userId }],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });
    const friendIds = friends.map((f) =>
      f.userId === userId ? f.friendId : f.userId,
    );
    const getPosts = await this.prisma.post.findMany({
      where: {
        userId: {
          in: [userId, ...friendIds],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        likes: {
          where: {
            userId,
          },
          select: {
            userId: true,
          },
        },
        images: true,
        tags: {
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        comments: {
          take: 2,
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
    });
    const nextCursor =
      getPosts.length === limit ? getPosts[getPosts.length - 1].id : null;

    const posts = getPosts.map(({ likes, ...post }) => ({
      ...post,
      isLiked: likes.length > 0,
    }));
    return {
      success: true,
      posts,
      nextCursor,
    };
  }

  async detailPost(viewerId: string, postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
        comments: true,
        likes: true,
      },
    });
  }

  async deletePost(userId: string, postId: string) {
    const user = await this.prisma.post.findFirst({
      where: {
        userId,
        id: postId,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Post not found',
      };
    }

    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }
}
