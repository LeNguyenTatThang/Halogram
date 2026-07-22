import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create-post')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async createPost(
    @CurrentUser() user: JwtUser,
    @Body() body: { caption: string; status: string; tagUserIds?: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const tagUserIds = body.tagUserIds
      ? (JSON.parse(body.tagUserIds) as string[])
      : undefined;

    return this.postService.createPost({
      caption: body.caption,
      userId: user.id,
      files,
      tagUserIds,
    });
  }

  @Put('update-post/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async updatePost(
    @CurrentUser() user: JwtUser,
    @Body() body: { caption: string; status: string; tagUserIds?: string },
    @Param('id') id: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const tagUserIds = body.tagUserIds
      ? (JSON.parse(body.tagUserIds) as string[])
      : undefined;

    return this.postService.updatePost({
      postId: id,
      caption: body.caption,
      userId: user.id,
      files,
      tagUserIds,
    });
  }

  @Get('list-post')
  @UseGuards(JwtAuthGuard)
  async listPost(
    @CurrentUser() user: JwtUser,
    @Query('cursor') cursor?: string,
  ) {
    return this.postService.listPost(user.id, cursor);
  }

  @Post('detail-post/:id')
  @UseGuards(JwtAuthGuard)
  async detailPost(
    @CurrentUser() user: JwtUser,
    @Body() body: { postId: string },
  ) {
    return this.postService.detailPost(user.id, body.postId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserPosts(
    @CurrentUser() user: JwtUser,
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.postService.getUserPosts(user.id, userId, cursor);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  getSavedPosts(
    @CurrentUser() user: JwtUser,
    @Query('cursor') cursor?: string,
  ) {
    return this.postService.getSavedPosts(user.id, cursor);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  toggleSavePost(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.postService.toggleSavePost(user.id, id);
  }

  @Get('tagged/:userId')
  @UseGuards(JwtAuthGuard)
  getTaggedPosts(
    @CurrentUser() user: JwtUser,
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.postService.getTaggedPosts(user.id, userId, cursor);
  }

  @Delete('delete-post/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.postService.deletePost(user.id, id);
  }

  @Delete(':postId/tag/me')
  @UseGuards(JwtAuthGuard)
  async removeMyTag(
    @CurrentUser() user: JwtUser,
    @Param('postId') postId: string,
  ) {
    return this.postService.removeMyTag(user.id, postId);
  }
}
