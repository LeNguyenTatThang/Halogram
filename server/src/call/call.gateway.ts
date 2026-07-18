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

@WebSocketGateway({
  namespace: 'haloggram',
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

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
        const userId = payload.sub || payload.id;
        if (userId) {
          client.data.user = {
            id: userId,
            email: payload.email,
            username: payload.username,
          };
          await client.join(userId);
          console.log(`📞 Call Connected: ${client.id} joined room ${userId}`);
        } else {
          console.log(`📞 Call Connected: ${client.id} (no user ID in token)`);
        }
      } else {
        console.log(`📞 Call Connected: ${client.id} (no token)`);
      }
    } catch (err) {
      console.error(`📞 Call connection auth error: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`📞 Call Disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinCall')
  async handleJoinCall(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(roomId);
    console.log(`📞 ${client.id} joined call ${roomId}`);
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
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(payload.roomId);
    client.to(payload.receiverId).emit('incomingCall', payload);
  }

  @SubscribeMessage('acceptCall')
  async handleAcceptCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(payload.roomId);
    client.to(payload.roomId).emit('callAccepted', payload);
  }

  @SubscribeMessage('rejectCall')
  handleRejectCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('callRejected', payload);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('offer', payload);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('answer', payload);
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('iceCandidate', payload);
  }

  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('callEnded', payload);
  }
}
