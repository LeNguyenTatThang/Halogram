import { Injectable } from '@nestjs/common';

@Injectable()
export class OnlineStatusService {
  private onlineUsers = new Map<string, Set<string>>();

  onUserConnected(userId: string, socketId: string): boolean {
    let sockets = this.onlineUsers.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.onlineUsers.set(userId, sockets);
    }
    const wasOffline = sockets.size === 0;
    sockets.add(socketId);
    return wasOffline;
  }

  onUserDisconnected(userId: string, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return false;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      return true;
    }
    return false;
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.onlineUsers.keys());
  }
}
