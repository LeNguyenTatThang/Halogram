import { Module } from '@nestjs/common';
import { LivestreamController } from './livestream.controller';
import { LivestreamService } from './livestream.service';
import { LivestreamGateway } from './livestream.gateway';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [LivestreamController],
  providers: [LivestreamService, LivestreamGateway],
})
export class LivestreamModule {}
