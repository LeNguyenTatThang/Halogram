import { Body, Get, Post, Delete, Controller, UseGuards } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('add-friend')
  @UseGuards(JwtAuthGuard)
  async requestFriendship(
    @CurrentUser() { id: userId }: JwtUser,
    @Body('friend_id') friendId: string,
  ) {
    return this.friendshipsService.requestFriendship(userId, friendId);
  }

  @Post('accept-friend')
  @UseGuards(JwtAuthGuard)
  async acceptFriendship(
    @CurrentUser() { id: userId }: JwtUser,
    @Body('friend_id') friendId: string,
  ) {
    return this.friendshipsService.acceptFriendship(userId, friendId);
  }

  @Delete('remove-friend')
  @UseGuards(JwtAuthGuard)
  async removeFriendship(
    @CurrentUser() { id: userId }: JwtUser,
    @Body('friend_id') friendId: string,
  ) {
    return this.friendshipsService.removeFriendship(userId, friendId);
  }

  @Delete('cancel-friend')
  @UseGuards(JwtAuthGuard)
  async cancelFriendship(
    @CurrentUser() { id: userId }: JwtUser,
    @Body('friend_id') friendId: string,
  ) {
    return this.friendshipsService.cancelFriendship(userId, friendId);
  }

  @Post('block-friend')
  @UseGuards(JwtAuthGuard)
  async blockFriendship(
    @CurrentUser() { id: userId }: JwtUser,
    @Body('friend_id') friendId: string,
  ) {
    return this.friendshipsService.blockFriendship(userId, friendId);
  }

  @Delete('unblock-friend')
  @UseGuards(JwtAuthGuard)
  unblockFriendship(
    @CurrentUser() { id: userId }: JwtUser,
    @Body('friend_id') friendId: string,
  ) {
    return this.friendshipsService.unblockFriendship(userId, friendId);
  }

  @Get('friendship-requests')
  @UseGuards(JwtAuthGuard)
  getFriendshipRequests(@CurrentUser() { id: userId }: JwtUser) {
    return this.friendshipsService.getFriendshipRequests(userId);
  }

  @Get('friendships')
  @UseGuards(JwtAuthGuard)
  getFriendships(@CurrentUser() { id: userId }: JwtUser) {
    return this.friendshipsService.getFriendships(userId);
  }
}
