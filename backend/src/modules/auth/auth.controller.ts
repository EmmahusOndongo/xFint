import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SetPasswordDto } from './dtos/set-password.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { AUTH } from '../../config/auth.config';
import { APP } from '../../config/app.config';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private users: UsersService) {}

  // --- POST /auth/login ---
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    // 1) Validation des identifiants
    const u = await this.auth.validateUser(dto.email, dto.password);

    // 2) Signature des tokens (access + refresh)
    const { access, refresh } = this.auth.signTokens({
      id: u.id,
      email: u.email,
      role: u.role,
      must_set_password: u.must_set_password,
    });

    // 3) Écriture des tokens en cookies HTTP-only
    res.cookie(AUTH.ACCESS.COOKIE, access, {
      httpOnly: true,        // Non lisible par JS (mitige XSS)
      sameSite: 'lax',       // Mitige CSRF basique
      secure: APP.COOKIE_SECURE, // HTTPS uniquement si activé
      domain: APP.COOKIE_DOMAIN,
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie(AUTH.REFRESH.COOKIE, refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: APP.COOKIE_SECURE,
      domain: APP.COOKIE_DOMAIN,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    });

    // 4) Renvoie aussi les tokens dans la réponse (optionnel selon ton client)
    return {
      ok: true,
      accessToken: access,
      refreshToken: refresh,
    };
  }

  // --- POST /auth/logout ---
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Supprime les cookies d'authentification
    res.clearCookie(AUTH.ACCESS.COOKIE, {
      domain: APP.COOKIE_DOMAIN,
      secure: APP.COOKIE_SECURE,
      sameSite: 'lax',
    });
    res.clearCookie(AUTH.REFRESH.COOKIE, {
      domain: APP.COOKIE_DOMAIN,
      secure: APP.COOKIE_SECURE,
      sameSite: 'lax',
    });
    return { ok: true };
  }

  // --- GET /auth/me ---
  // Protégé par JWT : renvoie l'utilisateur courant (issu du payload JWT)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return user;
  }

  // --- POST /auth/set-password ---
  // IMPORTANT : pas de FirstLoginGuard ici pour autoriser le changement au 1er login
  @UseGuards(JwtAuthGuard)
  @Post('set-password')
  async setPassword(
    @CurrentUser() user: JwtUser,
    @Body() dto: SetPasswordDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // 1) Mise à jour du mot de passe
    await this.users.setPassword(user.sub, dto.newPassword);

    // 2) Réémission de tokens avec must_set_password = false
    const freshPayload = {
      id: user.sub,
      email: user.email,
      role: user.role,
      must_set_password: false,
    };
    const { access, refresh } = this.auth.signTokens(freshPayload);

    // 3) Mise à jour des cookies
    res.cookie(AUTH.ACCESS.COOKIE, access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: APP.COOKIE_SECURE,
      domain: APP.COOKIE_DOMAIN,
      maxAge: 1000 * 60 * 60,
    });
    res.cookie(AUTH.REFRESH.COOKIE, refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: APP.COOKIE_SECURE,
      domain: APP.COOKIE_DOMAIN,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { ok: true };
  }
}
