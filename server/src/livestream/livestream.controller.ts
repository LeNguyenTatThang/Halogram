import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LivestreamService } from './livestream.service';
import { CreateLivestreamDto } from './dto/create-livestream.dto';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly livestreamService: LivestreamService) {}

  @Get('active')
  getActive() {
    return this.livestreamService.getActive();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.livestreamService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.livestreamService.getMessages(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateLivestreamDto) {
    return this.livestreamService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/end')
  endStream(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.livestreamService.endStream(id, user.id);
  }
}
