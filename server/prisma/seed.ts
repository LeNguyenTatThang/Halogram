import { PrismaClient, FriendshipStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MAIN_EMAIL = 'dez@gmail.com';

const users: any[] = [];
const posts: any[] = [];

async function main() {
  console.log('🌱 Seed with MAIN ACCOUNT CENTER');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // =========================
  // 1. CREATE MAIN USER FIRST
  // =========================
  const mainUser = await prisma.user.findUnique({
    where: { email: MAIN_EMAIL },
  });

  if (!mainUser) {
    throw new Error('Main user not found');
  }

  users.push(mainUser);

  console.log('👑 Main user loaded:', mainUser.username);

  // =========================
  // 2. CREATE FAKE USERS (30)
  // =========================
  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username().toLowerCase() + i,
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        displayName: faker.person.fullName(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        isVerified: faker.datatype.boolean(),
      },
    });

    users.push(user);
  }

  console.log('Users created:', users.length);

  // =========================
  // 3. FORCE MAIN USER FOLLOW OTHERS
  // =========================
  for (const u of users.slice(1)) {
    await prisma.follow.create({
      data: {
        followerId: mainUser.id,
        followingId: u.id,
      },
    });

    // optional: follow back
    if (Math.random() > 0.3) {
      await prisma.follow.create({
        data: {
          followerId: u.id,
          followingId: mainUser.id,
        },
      });
    }
  }

  console.log('Follow graph created');

  // =========================
  // 4. POSTS (all users + main user active)
  // =========================
  for (const user of users) {
    const postCount = user.id === mainUser.id ? 8 : 3;

    for (let i = 0; i < postCount; i++) {
      const post = await prisma.post.create({
        data: {
          caption: faker.lorem.sentence(),
          userId: user.id,
        },
      });

      posts.push(post);

      const imageCount = faker.number.int({ min: 1, max: 4 });

      for (let j = 0; j < imageCount; j++) {
        await prisma.postImage.create({
          data: {
            postId: post.id,
            url: faker.image.urlPicsumPhotos(),
          },
        });
      }
    }
  }

  console.log('Posts created');

  // =========================
  // 5. MAIN USER ENGAGEMENT (IMPORTANT)
  // =========================
  for (const post of posts) {
    const isMainPost = post.userId === mainUser.id;

    // main user always interacts
    await prisma.postLike.create({
      data: {
        postId: post.id,
        userId: mainUser.id,
      },
    });

    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: mainUser.id,
        text: faker.lorem.sentence(),
      },
    });

    // others also interact more with main posts
    const extra = isMainPost ? 10 : 3;

    const shuffled = faker.helpers.shuffle(users);

    for (let i = 0; i < extra; i++) {
      const u = shuffled[i];

      if (u.id === mainUser.id) continue;

      try {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: u.id,
          },
        });
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }

  console.log('Engagement done');

  // =========================
  // 6. STORIES (main user heavy)
  // =========================
  for (const user of users) {
    const count = user.id === mainUser.id ? 5 : 1;

    for (let i = 0; i < count; i++) {
      await prisma.story.create({
        data: {
          userId: user.id,
          image: faker.image.urlPicsumPhotos(),
        },
      });
    }
  }

  console.log('Stories done');

  // =========================
  // 7. FRIENDSHIP (centered)
  // =========================
  for (const u of users.slice(1)) {
    await prisma.friendship.create({
      data: {
        userId: mainUser.id,
        friendId: u.id,
        status: FriendshipStatus.ACCEPTED,
      },
    });
  }

  console.log('Friendship done');

  console.log('✅ DONE - MAIN ACCOUNT CENTERED DATA');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
