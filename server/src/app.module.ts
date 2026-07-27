import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PostModule } from './post/post.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { CallModule } from './call/call.module';
import { OnlineModule } from './online/online.module';
import { LivestreamModule } from './livestream/livestream.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    PostModule,
    UsersModule,
    CommentsModule,
    LikesModule,
    FollowsModule,
    FriendshipsModule,
    NotificationsModule,
    MessagesModule,
    CallModule,
    OnlineModule,
    LivestreamModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
