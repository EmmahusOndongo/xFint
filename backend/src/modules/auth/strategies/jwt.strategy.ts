// apps/backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

function cookieExtractor(req: Request): string | null {
  if (!req || !req.cookies) return null;
  // Essaie le nom depuis l'env, sinon 'sh_access'
  const nameFromEnv = process.env.AUTH_COOKIE_ACCESS || 'sh_access';
  return req.cookies[nameFromEnv] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET is missing in environment');

    super({
      // ✅ Lis d’abord le cookie, puis (fallback) le Bearer header
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // ✅ IMPORTANT : on RETOURNE l’objet; pas de "done" ici
  async validate(payload: any) {
    // payload: { sub, email, role, must_set_password }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      must_set_password: payload.must_set_password,
    };
  }
}
