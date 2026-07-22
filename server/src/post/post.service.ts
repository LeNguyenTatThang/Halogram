import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createPost(data: {
    caption?: string;
    userId: string;
    files?: Express.Multer.File[];
  }) {
    try {
      if (!data.caption?.trim() && (!data.files || data.files.length === 0)) {
        throw new Error('Post must have a caption or an image');
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
        },
      });

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
  }) {
    const post = await this.prisma.post.findFirst({
      where: { id: data.postId },
      include: { images: true },
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
      ? await this.cloudinaryService.uploadImages(
          data.files,
          'halogram/posts',
        )
      : [];

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
