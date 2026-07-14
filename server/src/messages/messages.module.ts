import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessagesGateway } from './gateways/messages.gateway';

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, WsJwtGuard],
})
export class MessagesModule {}
