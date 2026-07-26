import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LivestreamService } from './livestream.service';
import type { CreateLivestreamDto } from './dto/create-livestream.dto';
import type { Request } from 'express';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly livestreamService: LivestreamService) {}

  @Get('active')
  getActive() {
    return this.livestreamService.getActive();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.livestreamService.getById(id);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
  ) {
    return this.livestreamService.getMessages(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Req() req: Request,
    @Body() dto: CreateLivestreamDto,
  ) {
    const userId = (req.user as any).id;
    return this.livestreamService.create(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/end')
  endStream(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.livestreamService.endStream(id, userId);
  }
}
