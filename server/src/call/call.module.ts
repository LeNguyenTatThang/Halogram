import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [AuthModule],
  providers: [CallGateway, WsJwtGuard],
  exports: [CallGateway],
})
export class CallModule {}
