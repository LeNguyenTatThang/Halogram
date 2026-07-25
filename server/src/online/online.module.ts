import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OnlineGateway } from './online.gateway';
import { OnlineStatusService } from './online-status.service';

@Module({
  imports: [AuthModule],
  providers: [OnlineStatusService, OnlineGateway],
  exports: [OnlineStatusService],
})
export class OnlineModule {}
