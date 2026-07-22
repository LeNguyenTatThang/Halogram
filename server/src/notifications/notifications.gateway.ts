import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'haloggram',
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
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
          client.data.user = {
            id: userId,
            email: payload.email,
            username: payload.username,
          };
          await client.join(userId);
        }
      }
    } catch {
      // Ignore connection errors for unauthenticated users
    }
  }

  handleDisconnect() {
    // No cleanup needed
  }

  emitNotification(userId: string, notification: Record<string, unknown>) {
    this.server.to(userId).emit('notification:new', notification);
  }
}
