import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersRepository } from '../../users/users.repository';
import type { AuthUser } from '@ahansk/shared';

interface JwtPayload {
  sub: number | string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  type: 'access' | 'partial';
}

// Extract JWT from httpOnly cookie first, fallback to Bearer header (for /v1/* API clients)
function cookieOrBearerExtractor(req: Request): string | null {
  if (req?.cookies?.access_token) return req.cookies.access_token as string;
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersRepo: UsersRepository,
  ) {
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.jwt.accessSecret', ''),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (payload.type === 'partial') {
      throw new UnauthorizedException('Partial token cannot access this resource');
    }

    const user = await this.usersRepo.findActiveById(Number(payload.sub));

    if (!user) throw new UnauthorizedException('User not found or inactive');

    if (user.bans && user.bans.length > 0) {
      throw new UnauthorizedException('Account has been suspended');
    }

    return {
      id: Number(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.totp_enabled,
      avatar: user.avatar,
    };
  }
}
