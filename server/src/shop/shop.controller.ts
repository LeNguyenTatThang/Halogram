import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(
    @CurrentUser() user: JwtUser,
    @Body()
    dto: {
      name: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    return this.shopService.register(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-shop')
  getMyShop(@CurrentUser() user: JwtUser) {
    return this.shopService.getMyShop(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  update(
    @CurrentUser() user: JwtUser,
    @Body()
    dto: {
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    return this.shopService.update(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.shopService.uploadLogo(user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  uploadCover(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.shopService.uploadCover(user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verification-status')
  getVerificationStatus(@CurrentUser() user: JwtUser) {
    return this.shopService.getVerificationStatus(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verifications/pending')
  getPendingVerifications() {
    return this.shopService.getPendingVerifications();
  }

  @UseGuards(JwtAuthGuard)
  @Post('verifications/:shopId/approve')
  approveVerification(@Param('shopId') shopId: string) {
    return this.shopService.approveVerification(shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verifications/:shopId/reject')
  rejectVerification(
    @Param('shopId') shopId: string,
    @Body() body: { notes?: string },
  ) {
    return this.shopService.rejectVerification(shopId, body.notes);
  }

  @Get(':slugOrId')
  getShop(@Param('slugOrId') slugOrId: string) {
    const isId = /^[a-z0-9]{20,}$/i.test(slugOrId);
    return isId
      ? this.shopService.getById(slugOrId)
      : this.shopService.getBySlug(slugOrId);
  }
}
