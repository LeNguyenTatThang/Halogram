import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnlineStatusService } from './online-status.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

const gatewayOrigins = (
  process.env.CORS_ORIGINS || 'http://localhost:5173'
).split(',');

@WebSocketGateway({
  namespace: 'haloggram',
  cors: {
    origin: gatewayOrigins,
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class OnlineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(OnlineGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly onlineStatusService: OnlineStatusService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const tokenFromAuth = client.handshake.auth?.token;
      const authHeader = client.handshake.headers.authorization;
      const token =
        typeof tokenFromAuth === 'string'
          ? tokenFromAuth
          : typeof authHeader === 'string'
            ? authHeader.replace(/^Bearer\s+/i, '')
            : undefined;

      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        const userId = payload.sub || payload.id;
        if (userId) {
          client.data.user = { id: userId };
          this.onlineStatusService.onUserConnected(
            userId as string,
            client.id,
          );

          client.emit('onlineUsers', {
            userIds: this.onlineStatusService.getOnlineUserIds(),
          });
        }
      }
    } catch {
      this.logger.warn(`Online connection failed auth: ${client.id}`);
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    const userIds = this.onlineStatusService.getOnlineUserIds();
    client.emit('onlineUsers', { userIds });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (userId) {
      this.onlineStatusService.onUserDisconnected(
        userId as string,
        client.id,
      );
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
