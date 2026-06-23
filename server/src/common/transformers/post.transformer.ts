import { UserTransformer } from './user.transformer';

export class PostTransformer {
  static transform(post: any) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: post.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      content: post.content,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      imageUrl: post.imageUrl,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      createdAt: post.createdAt,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      user: post.user ? UserTransformer.transform(post.user) : null,
    };
  }

  static collection(posts: any[]) {
    return posts.map((post) => this.transform(post));
  }
}
