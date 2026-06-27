import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
    @Body() body: { caption: string; status: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.createPost({
      caption: body.caption,
      userId: user.id,
      files,
    });
  }

  @Put('update-post/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async updatePost(
    @CurrentUser() user: JwtUser,
    @Body() body: { caption: string; status: string },
    @Param('id') id: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.postService.updatePost({
      postId: id,
      caption: body.caption,
      userId: user.id,
      files,
    });
  }

  @Get('list-post')
  @UseGuards(JwtAuthGuard)
  async listPost(@CurrentUser() user: JwtUser) {
    return this.postService.listPost(user.id);
  }

  @Post('detail-post/:id')
  @UseGuards(JwtAuthGuard)
  async detailPost(
    @CurrentUser() user: JwtUser,
    @Body() body: { postId: string },
  ) {
    return this.postService.detailPost(user.id, body.postId);
  }
  @Delete('delete-post/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @CurrentUser() user: JwtUser,
    @Body() body: { postId: string },
  ) {
    return this.postService.deletePost(user.id, body.postId);
  }
}
