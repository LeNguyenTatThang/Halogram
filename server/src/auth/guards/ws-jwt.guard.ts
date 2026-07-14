import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    const authHeader = client.handshake.headers.authorization;
    const tokenFromAuth = client.handshake.auth?.token;
    const token =
      typeof tokenFromAuth === 'string'
        ? tokenFromAuth
        : typeof authHeader === 'string'
          ? authHeader.replace(/^Bearer\s+/i, '')
          : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = this.jwtService.verify(token);

      client.data.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
