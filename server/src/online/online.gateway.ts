import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnlineStatusService } from './online-status.service';

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
          const wasOffline = this.onlineStatusService.onUserConnected(
            userId as string,
            client.id,
          );

          if (wasOffline) {
            this.server.emit('userOnline', { userId });
          }

          client.emit('onlineUsers', {
            userIds: this.onlineStatusService.getOnlineUserIds(),
          });
        }
      }
    } catch {
      // Ignore connection errors for unauthenticated users
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const userIds = this.onlineStatusService.getOnlineUserIds();
    client.emit('onlineUsers', { userIds });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (userId) {
      const isNowOffline = this.onlineStatusService.onUserDisconnected(
        userId as string,
        client.id,
      );

      if (isNowOffline) {
        this.server.emit('userOffline', { userId });
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
