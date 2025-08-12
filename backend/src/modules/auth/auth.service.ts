import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AUTH } from '../../config/auth.config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private users: UsersService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.password_hash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(pass, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  signTokens(user: { id: string; email: string; role: string; must_set_password: boolean }) {
    const payload = { sub: user.id, email: user.email, role: user.role, must_set_password: user.must_set_password };
    const access = this.jwt.sign(payload, { secret: AUTH.ACCESS.SECRET, expiresIn: AUTH.ACCESS.EXPIRES_IN });
    const refresh = this.jwt.sign({ sub: user.id }, { secret: AUTH.REFRESH.SECRET, expiresIn: AUTH.REFRESH.EXPIRES_IN });
    return { access, refresh };
  }
}
