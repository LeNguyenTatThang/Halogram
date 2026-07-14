import { PrismaClient, FriendshipStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const MAIN_EMAIL = 'dez@gmail.com';

async function main() {
  console.log('🌱 Seeding...');
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.storyView.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.story.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany({ where: { email: { not: MAIN_EMAIL } } });

  const password = await bcrypt.hash('123456', 10);

  const mainUser = await prisma.user.upsert({
    where: { email: MAIN_EMAIL },
    update: {},
    create: {
      username: 'dez',
      email: MAIN_EMAIL,
      password,
      displayName: 'Dez',
      firstName: 'Dez',
      lastName: 'Developer',
      avatar: faker.image.avatar(),
      bio: 'Main account',
      isVerified: true,
    },
  });

  const users = [mainUser];

  for (let i = 0; i < 30; i++) {
    users.push(
      await prisma.user.create({
        data: {
          username: `${faker.internet.username().toLowerCase()}${i}`,
          email: faker.internet.email().toLowerCase(),
          password,
          displayName: faker.person.fullName(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          isVerified: faker.datatype.boolean(),
        },
      }),
    );
  }

  const posts: any[] = [];

  for (const u of users) {
    if (u.id !== mainUser.id) {
      await prisma.follow.create({
        data: { followerId: mainUser.id, followingId: u.id },
      });
      if (Math.random() > 0.3) {
        await prisma.follow.create({
          data: { followerId: u.id, followingId: mainUser.id },
        });
      }
    }

    const pc = u.id === mainUser.id ? 8 : 3;
    for (let i = 0; i < pc; i++) {
      const post = await prisma.post.create({
        data: { userId: u.id, caption: faker.lorem.sentence() },
      });
      posts.push(post);
      const imgs = faker.number.int({ min: 1, max: 4 });
      for (let j = 0; j < imgs; j++) {
        await prisma.postImage.create({
          data: { postId: post.id, url: faker.image.urlPicsumPhotos() },
        });
      }
    }

    const sc = u.id === mainUser.id ? 5 : 1;
    for (let i = 0; i < sc; i++) {
      await prisma.story.create({
        data: { userId: u.id, image: faker.image.urlPicsumPhotos() },
      });
    }
  }

  for (const post of posts) {
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: mainUser.id,
        text: faker.lorem.sentence(),
      },
    });
    try {
      await prisma.postLike.create({
        data: { postId: post.id, userId: mainUser.id },
      });
      // eslint-disable-next-line no-empty
    } catch {}
    const shuffled = faker.helpers.shuffle(users);
    const extra = post.userId === mainUser.id ? 10 : 3;
    for (let i = 0; i < extra; i++) {
      const u = shuffled[i];
      if (!u || u.id === mainUser.id) continue;
      try {
        await prisma.postLike.create({
          data: { postId: post.id, userId: u.id },
        });
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }

  for (const u of users) {
    if (u.id === mainUser.id) continue;
    await prisma.friendship.create({
      data: {
        userId: mainUser.id,
        friendId: u.id,
        status: FriendshipStatus.ACCEPTED,
      },
    });
  }

  for (const u of users.slice(1, 8)) {
    const c = await prisma.conversation.create({ data: {} });
    await prisma.conversationMember.createMany({
      data: [
        { conversationId: c.id, userId: mainUser.id },
        { conversationId: c.id, userId: u.id },
      ],
    });
    for (let i = 0; i < 20; i++) {
      await prisma.message.create({
        data: {
          conversationId: c.id,
          senderId: Math.random() > 0.5 ? mainUser.id : u.id,
          content: faker.lorem.sentence(),
        },
      });
    }
  }
  console.log('✅ Done');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
