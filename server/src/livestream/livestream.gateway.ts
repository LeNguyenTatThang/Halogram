import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { LivestreamService } from './livestream.service';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

const gatewayOrigins = (
  process.env.CORS_ORIGINS || 'http://localhost:5173'
).split(',');

interface ViewerInfo {
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  isVerified: boolean;
}

@WebSocketGateway({
  namespace: 'haloggram',
  cors: {
    origin: gatewayOrigins,
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class LivestreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private livestreamViewers = new Map<string, Map<string, ViewerInfo>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly livestreamService: LivestreamService,
  ) {}

  private readonly logger = new Logger(LivestreamGateway.name);

  private extractUserId(client: Socket): string | null {
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
        const userId = (payload.sub || payload.id) as string;
        if (userId) {
          client.data.user = {
            id: userId,
            email: payload.email,
            username: payload.username,
          };
        }
        return userId;
      }
    } catch {
      this.logger.warn(`Livestream gateway auth failed for ${client.id}`);
    }
    return null;
  }

  async handleConnection(client: Socket) {
    this.extractUserId(client);
  }

  handleDisconnect(client: Socket) {
    for (const [livestreamId, viewers] of this.livestreamViewers.entries()) {
      if (viewers.has(client.id)) {
        const viewer = viewers.get(client.id)!;
        viewers.delete(client.id);

        if (viewers.size === 0) {
          this.livestreamViewers.delete(livestreamId);
        }

        this.livestreamService
          .decrementViewerCount(livestreamId)
          .catch(() => {});

        this.server.to(livestreamId).emit('livestream:viewer-count', {
          livestreamId,
          count: viewers.size,
        });

        this.server.to(livestreamId).emit('livestream:viewer-left', {
          userId: viewer.userId,
          username: viewer.username,
        });

        break;
      }
    }
  }

  @SubscribeMessage('livestream:join')
  async handleJoin(
    @MessageBody() data: { livestreamId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserId(client);
    if (!userId) {
      client.emit('livestream:error', { message: 'Authentication required' });
      return;
    }

    const livestream = await this.livestreamService.getById(data.livestreamId);
    if (!livestream || livestream.status !== 'LIVE') {
      client.emit('livestream:error', { message: 'Livestream is not active' });
      return;
    }

    await client.join(data.livestreamId);

    if (!this.livestreamViewers.has(data.livestreamId)) {
      this.livestreamViewers.set(data.livestreamId, new Map());
    }

    const viewers = this.livestreamViewers.get(data.livestreamId)!;
    const viewerInfo: ViewerInfo = {
      userId,
      username: client.data.user?.username || 'unknown',
      displayName: client.data.user?.username || 'Unknown',
      avatar: null,
      isVerified: false,
    };

    if (!viewers.has(client.id)) {
      viewers.set(client.id, viewerInfo);
      await this.livestreamService.incrementViewerCount(data.livestreamId);
    }

    this.server.to(data.livestreamId).emit('livestream:viewer-count', {
      livestreamId: data.livestreamId,
      count: viewers.size,
    });

    this.server.to(data.livestreamId).emit('livestream:viewer-joined', {
      userId,
      username: viewerInfo.username,
    });

    const streamerId = livestream.streamer.id;
    this.server.to(streamerId).emit('livestream:viewer-connected', {
      viewerId: userId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('livestream:leave')
  async handleLeave(
    @MessageBody() data: { livestreamId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.removeViewer(client, data.livestreamId);
  }

  private async removeViewer(client: Socket, livestreamId: string) {
    const viewers = this.livestreamViewers.get(livestreamId);
    if (viewers && viewers.has(client.id)) {
      const viewer = viewers.get(client.id)!;
      viewers.delete(client.id);

      if (viewers.size === 0) {
        this.livestreamViewers.delete(livestreamId);
      }

      await this.livestreamService.decrementViewerCount(livestreamId);

      this.server.to(livestreamId).emit('livestream:viewer-count', {
        livestreamId,
        count: viewers.size,
      });

      this.server.to(livestreamId).emit('livestream:viewer-left', {
        userId: viewer.userId,
        username: viewer.username,
      });
    }

    await client.leave(livestreamId);
  }

  @SubscribeMessage('livestream:viewer-offer')
  async handleViewerOffer(
    @MessageBody()
    data: {
      livestreamId: string;
      offer: RTCSessionDescriptionInit;
      viewerSocketId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserId(client);
    if (!userId) return;

    if (!client.rooms.has(data.livestreamId)) {
      client.emit('livestream:error', { message: 'Not a participant in this livestream' });
      return;
    }

    const livestream = await this.livestreamService.getById(data.livestreamId);
    if (!livestream) return;

    this.server.to(livestream.streamerId).emit('livestream:viewer-offer', {
      livestreamId: data.livestreamId,
      offer: data.offer,
      viewerSocketId: data.viewerSocketId,
    });
  }

  @SubscribeMessage('livestream:streamer-answer')
  async handleStreamerAnswer(
    @MessageBody()
    data: {
      viewerSocketId: string;
      answer: RTCSessionDescriptionInit;
      livestreamId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserId(client);
    if (!userId) return;

    if (!data.livestreamId) {
      client.emit('livestream:error', { message: 'livestreamId required' });
      return;
    }

    const livestream = await this.livestreamService.getById(data.livestreamId);
    if (!livestream || livestream.streamerId !== userId) {
      client.emit('livestream:error', { message: 'Only the streamer can send answers' });
      return;
    }

    client.to(data.viewerSocketId).emit('livestream:streamer-answer', {
      answer: data.answer,
    });
  }

  @SubscribeMessage('livestream:ice-candidate')
  async handleIceCandidate(
    @MessageBody()
    data: {
      livestreamId: string;
      candidate: RTCIceCandidateInit;
      targetSocketId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserId(client);
    if (!userId) return;

    if (!client.rooms.has(data.livestreamId)) {
      return;
    }

    if (data.targetSocketId) {
      this.server.to(data.targetSocketId).emit('livestream:ice-candidate', {
        candidate: data.candidate,
        fromSocketId: client.id,
      });
    }
  }

  @SubscribeMessage('livestream:chat-message')
  async handleChatMessage(
    @MessageBody() data: { livestreamId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserId(client);
    if (!userId || !data.content.trim()) return;

    const message = await this.livestreamService.addMessage(
      data.livestreamId,
      userId,
      data.content.trim(),
    );

    this.server.to(data.livestreamId).emit('livestream:chat-message', message);
  }

  @SubscribeMessage('livestream:end')
  async handleEndStream(
    @MessageBody() data: { livestreamId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserId(client);
    if (!userId) return;

    try {
      await this.livestreamService.endStream(data.livestreamId, userId);

      this.server.to(data.livestreamId).emit('livestream:ended', {
        livestreamId: data.livestreamId,
      });

      const sockets = await this.server.in(data.livestreamId).fetchSockets();
      for (const sock of sockets) {
        await sock.leave(data.livestreamId);
      }

      this.livestreamViewers.delete(data.livestreamId);
    } catch {
      client.emit('livestream:error', { message: 'Failed to end livestream' });
    }
  }

  @SubscribeMessage('livestream:ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('livestream:pong');
  }
}
