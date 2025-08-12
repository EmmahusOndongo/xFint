// apps/backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const cookieName = process.env.AUTH_COOKIE_ACCESS || 'sh_access';
const cookieExtractor = (req: any) => req?.cookies?.[cookieName] || null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET is missing in environment');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any, done: VerifiedCallback) {
    // payload: { sub, email, role, must_set_password }
    return done(null, payload);
  }
}
