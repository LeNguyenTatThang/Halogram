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

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`📞 Call Connected: ${client.id}`);
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
  }

  @SubscribeMessage('leaveCall')
  async handleLeaveCall(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(roomId);
  }

  @SubscribeMessage('callUser')
  handleCallUser(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('incomingCall', payload);
  }

  @SubscribeMessage('acceptCall')
  handleAcceptCall(
    @MessageBody() payload: CallPayload,
    @ConnectedSocket() client: Socket,
  ) {
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
