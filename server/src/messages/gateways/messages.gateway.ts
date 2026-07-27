import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages.service';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

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
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

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
          await client.join(userId as string);
        }
      }
    } catch (err) {
      this.logger.warn(
        `Messages gateway auth error: ${client.id} - ${(err as Error).message}`,
      );
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    try {
      await this.messagesService.checkMember(conversationId, userId);
      await client.join(conversationId);
      this.logger.log(
        `Client ${client.id} joined conversation ${conversationId}`,
      );
    } catch {
      client.emit('error', { message: 'Not a member of this conversation' });
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    await client.leave(conversationId);
    this.logger.log(`Client ${client.id} left conversation ${conversationId}`);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    try {
      await this.messagesService.checkMember(payload.conversationId, userId);
      this.server.to(payload.conversationId).emit('typing', {
        conversationId: payload.conversationId,
        userId,
      });
    } catch {
      client.emit('error', { message: 'Not a member of this conversation' });
    }
  }

  @SubscribeMessage('stopTyping')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    try {
      await this.messagesService.checkMember(payload.conversationId, userId);
      this.server.to(payload.conversationId).emit('stopTyping', {
        conversationId: payload.conversationId,
        userId,
      });
    } catch {
      client.emit('error', { message: 'Not a member of this conversation' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: string; message: string; image?: string },
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    try {
      const message = await this.messagesService.createMessage(userId, {
        conversationId: payload.conversationId,
        content: payload.message,
        image: payload.image,
      });

      this.server.to(payload.conversationId).emit('receiveMessage', message);
    } catch (err) {
      client.emit('error', {
        message: err instanceof Error ? err.message : 'Failed to send message',
      });
    }
  }
}
