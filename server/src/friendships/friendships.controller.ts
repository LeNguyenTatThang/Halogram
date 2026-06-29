import { Controller } from '@nestjs/common';

@Controller('friendships')
export class FriendshipsController {
  constructor() {}

  requestFriendship(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.requestFriendship(userId, friendId);
  }

  acceptFriendship(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.acceptFriendship(userId, friendId);
  }

  removeFriendship(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.removeFriendship(userId, friendId);
  }

  cancelFriendship(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.cancelFriendship(userId, friendId);
  }

  blockFriendship(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.blockFriendship(userId, friendId);
  }

  unblockFriendship(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.unblockFriendship(userId, friendId);
  }

  getFriendshipStatus(userId: string, friendId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.getFriendshipStatus(userId, friendId);
  }

  getFriendshipRequests(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.getFriendshipRequests(userId);
  }

  getFriendships(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.getFriendships(userId);
  }
}
