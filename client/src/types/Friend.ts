export interface FriendUser {
  id: string;
  username: string;
  avatar: string | null;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  user: FriendUser;
  friend: FriendUser;
}