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
      console.log(data.files);
      const imageUrls = data.files?.length
        ? await this.cloudinaryService.uploadImages(
            data.files,
            'halogram/posts',
          )
        : [];
      console.log(imageUrls);

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
      console.log(
        imageUrls.map((url) => ({
          url,
        })),
      );

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
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  async listPost(userId: string, cursor?: string, limit = 10) {
    try {
      const posts = await this.prisma.post.findMany({
        where: { userId },
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
          _count: {
            select: {
              likes: true,
              comments: true,
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
        posts.length === limit ? posts[posts.length - 1].id : null;
      return {
        success: true,
        posts,
        nextCursor,
      };
    } catch (error) {
      console.log(error);
    }
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
    try {
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
    } catch (error) {
      console.log(error);
    }
  }
}
