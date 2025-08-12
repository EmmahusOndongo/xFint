// apps/backend/src/modules/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private users: UsersService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.password_hash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(pass, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  signTokens(user: { id: string; email: string; role: string; must_set_password: boolean }) {
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET')!;
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET')!;
    const accessExp = this.config.get<string>('JWT_ACCESS_EXPIRES') || '1h';
    const refreshExp = this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d';

    const payload = { sub: user.id, email: user.email, role: user.role, must_set_password: user.must_set_password };
    const access = this.jwt.sign(payload, { secret: accessSecret, expiresIn: accessExp });
    const refresh = this.jwt.sign({ sub: user.id }, { secret: refreshSecret, expiresIn: refreshExp });
    return { access, refresh };
  }
}
