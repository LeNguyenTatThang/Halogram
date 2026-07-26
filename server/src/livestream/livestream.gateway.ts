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
export class LivestreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private livestreamViewers = new Map<string, Map<string, ViewerInfo>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly livestreamService: LivestreamService,
  ) {}

  private extractUserId(client: Socket): string | null {
    try {
      const tokenFromAuth = client.handshake.auth?.token;
      const token =
        typeof tokenFromAuth === 'string'
          ? tokenFromAuth
          : undefined;

      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        return (payload.sub || payload.id) as string;
      }
    } catch {
      // ignore
    }
    return null;
  }

  async handleConnection() {
    // Auth is handled per-event or via middleware
  }

  handleDisconnect(client: Socket) {
    for (const [livestreamId, viewers] of this.livestreamViewers.entries()) {
      if (viewers.has(client.id)) {
        const viewer = viewers.get(client.id)!;
        viewers.delete(client.id);

        if (viewers.size === 0) {
          this.livestreamViewers.delete(livestreamId);
        }

        this.livestreamService.decrementViewerCount(livestreamId).catch(() => {});

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
      username: (client.handshake.auth as any)?.username || 'unknown',
      displayName: (client.handshake.auth as any)?.displayName || 'Unknown',
      avatar: (client.handshake.auth as any)?.avatar || null,
      isVerified: (client.handshake.auth as any)?.isVerified || false,
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
    @MessageBody() data: { livestreamId: string; offer: RTCSessionDescriptionInit; viewerSocketId: string },
  ) {
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
    @MessageBody() data: { viewerSocketId: string; answer: RTCSessionDescriptionInit },
  ) {
    this.server.to(data.viewerSocketId).emit('livestream:streamer-answer', {
      answer: data.answer,
    });
  }

  @SubscribeMessage('livestream:ice-candidate')
  async handleIceCandidate(
    @MessageBody() data: { livestreamId: string; candidate: RTCIceCandidateInit; targetSocketId?: string },
    @ConnectedSocket() client: Socket,
  ) {
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
