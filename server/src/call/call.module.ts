import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CallGateway],
  exports: [CallGateway],
})
export class CallModule {}
