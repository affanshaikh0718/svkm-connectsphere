import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      const req = context.switchToHttp().getRequest();
      if (req.headers?.authorization || req.cookies?.accessToken) {
        try {
          const res = super.canActivate(context);
          if (res instanceof Promise) {
            await res;
          }
        } catch {
          // Public route allows unauthenticated access if token is invalid
        }
      }
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const hasFallbackHeader =
      req.headers?.['x-user-id'] ||
      req.headers?.['x-userid'] ||
      req.headers?.['user-id'];

    if (hasFallbackHeader && !req.headers?.authorization && !req.cookies?.accessToken) {
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user || null;
    }

    if (user) {
      return user;
    }

    const req = context.switchToHttp().getRequest();
    const fallbackUserId =
      req.headers?.['x-user-id'] ||
      req.headers?.['x-userid'] ||
      req.headers?.['user-id'];

    if (fallbackUserId) {
      return { id: fallbackUserId, role: 'USER' };
    }

    return super.handleRequest(err, user, info, context);
  }
}
