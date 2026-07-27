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
import type CallPayload from './dto/call-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CallGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const tokenFromAuth = client.handshake.auth?.token;
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
          await client.join(userId);
        }
      }
    } catch {
      this.logger.warn(`Call gateway auth failed for ${client.id}`);
    }
  }

  private isCallParticipant(roomId: string, userId: string): boolean {
    const parts = roomId.split('_');
    if (parts.length < 4 || parts[0] !== 'call') return false;
    const callerId = parts[1];
    const receiverId = parts[2];
    return userId === callerId || userId === receiverId;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Call client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinCall')
  async handleJoinCall(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    if (!this.isCallParticipant(roomId, userId)) {
      client.emit('error', { message: 'Not a participant in this call' });
      return;
    }

    await client.join(roomId);
  }

  @SubscribeMessage('leaveCall')
  async handleLeaveCall(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(roomId);
  }

  @SubscribeMessage('callUser')
  async handleCallUser(
    @MessageBody() payload: { receiverId: string; type: 'AUDIO' | 'VIDEO' },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    const username = client.data.user?.username as string | undefined;
    if (!userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    const roomId = `call_${userId}_${payload.receiverId}_${Date.now()}`;
    const callPayload: CallPayload = {
      roomId,
      receiverId: payload.receiverId,
      callerId: userId,
      callerName: username || 'Unknown',
      type: payload.type,
    };

    await client.join(roomId);
    client.to(payload.receiverId).emit('incomingCall', callPayload);
  }

  @SubscribeMessage('acceptCall')
  async handleAcceptCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    if (payload.receiverId !== userId) {
      client.emit('error', { message: 'Not authorized to accept this call' });
      return;
    }

    await client.join(payload.roomId);
    client.to(payload.roomId).emit('callAccepted', payload);
  }

  @SubscribeMessage('rejectCall')
  handleRejectCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    if (!this.isCallParticipant(payload.roomId, userId)) {
      client.emit('error', { message: 'Not a participant in this call' });
      return;
    }

    client.to(payload.roomId).emit('callRejected', payload);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    if (!this.isCallParticipant(payload.roomId, userId)) {
      client.emit('error', { message: 'Not a participant in this call' });
      return;
    }

    client.to(payload.roomId).emit('offer', payload);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    if (!this.isCallParticipant(payload.roomId, userId)) {
      client.emit('error', { message: 'Not a participant in this call' });
      return;
    }

    client.to(payload.roomId).emit('answer', payload);
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    if (!this.isCallParticipant(payload.roomId, userId)) {
      client.emit('error', { message: 'Not a participant in this call' });
      return;
    }

    client.to(payload.roomId).emit('iceCandidate', payload);
  }

  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id as string | undefined;
    if (!userId) return;

    if (!this.isCallParticipant(payload.roomId, userId)) {
      client.emit('error', { message: 'Not a participant in this call' });
      return;
    }

    client.to(payload.roomId).emit('callEnded', payload);
  }
}
