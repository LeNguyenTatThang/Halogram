import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';
import type { JwtUser } from '../interfaces/jwt-user.interface';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
