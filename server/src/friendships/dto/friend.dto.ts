import { IsString } from 'class-validator';

export class FriendDto {
  @IsString()
  friendId: string | undefined;
}
