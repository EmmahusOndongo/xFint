import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { AUTH } from '../../../config/auth.config';

const cookieExtractor = (req: any) => req?.cookies?.[AUTH.ACCESS.COOKIE] || null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: AUTH.ACCESS.SECRET,
    });
  }
  async validate(payload: any, done: VerifiedCallback) {
    // payload: { sub, email, role, must_set_password }
    return done(null, payload);
  }
}
