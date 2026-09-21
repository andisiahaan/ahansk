import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import type { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService?: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    try {
      const result = await (super.canActivate(context) as Promise<boolean>);
      if (result && req.user) return true;
    } catch (err: unknown) {
      if (this.authService && req.cookies?.refresh_token) {
        const user = await this.authService.refreshSilently(req.cookies.refresh_token, req, res);
        if (user) {
          req.user = user;
          return true;
        }
      }

      if (isOptional) return true;
      throw err;
    }

    if (!req.user && this.authService && req.cookies?.refresh_token) {
      const user = await this.authService.refreshSilently(req.cookies.refresh_token, req, res);
      if (user) {
        req.user = user;
        return true;
      }
    }

    if (isOptional) return true;
    return false;
  }

  handleRequest<T = unknown>(err: unknown, user: T, _info: unknown, context: ExecutionContext): T {
    const isOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isOptional) return user;
    if (err) throw err;
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
