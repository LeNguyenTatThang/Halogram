import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendshipsService {
  constructor() {}

  requestFriendship(userId: string, friendId: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.requestFriendship(userId, friendId);
    } catch (error) {
      console.log(error);
    }
  }
}
