import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OnlineGateway } from './online.gateway';
import { OnlineStatusService } from './online-status.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [AuthModule],
  providers: [OnlineStatusService, OnlineGateway, WsJwtGuard],
  exports: [OnlineStatusService],
})
export class OnlineModule {}
