export class UserTransformer {
  static transform(user: any) {
    return {
      id: user.id,

      username: user.username,

      email: user.email,

      displayName: user.displayName,

      firstName: user.firstName,

      lastName: user.lastName,

      avatar: user.avatar,

      bio: user.bio,

      isVerified: user.isVerified,

      createdAt: user.createdAt,
    };
  }

  static collection(users: any[]) {
    return users.map((user) => this.transform(user));
  }
}
