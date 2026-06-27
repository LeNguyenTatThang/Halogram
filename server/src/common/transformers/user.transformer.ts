export class UserTransformer {
  static transform(user: any) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      id: user.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      username: user.username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      displayName: user.displayName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      firstName: user.firstName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      lastName: user.lastName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      avatar: user.avatar,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      bio: user.bio,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      isVerified: user.isVerified,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      createdAt: user.createdAt,
    };
  }

  static collection(users: any[]) {
    return users.map((user) => this.transform(user));
  }
}
