import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

// Fonction utilitaire pour extraire le JWT depuis un cookie
function cookieExtractor(req: Request): string | null {
  if (!req || !req.cookies) return null;

  // Nom du cookie défini dans les variables d'environnement, sinon valeur par défaut
  const nameFromEnv = process.env.AUTH_COOKIE_ACCESS || 'sh_access';

  // Retourne le token présent dans le cookie, ou null si absent
  return req.cookies[nameFromEnv] ?? null;
}

@Injectable()
// Stratégie JWT utilisée par Passport pour valider les tokens d'accès
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    // Récupère la clé secrète dans la configuration
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET is missing in environment');

    super({
      // ✅ Ordre de lecture du token :
      // 1. Depuis un cookie
      // 2. Sinon depuis l'en-tête Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false, // Refuse les tokens expirés
      secretOrKey: secret,     // Clé secrète pour vérifier la signature
    });
  }

  // Méthode appelée automatiquement si le token est valide
  // Elle permet de "façonner" l'objet utilisateur injecté dans req.user
  async validate(payload: any) {
    // Le payload est le contenu du JWT décodé
    return {
      sub: payload.sub,                       // Identifiant unique de l'utilisateur
      email: payload.email,                   // Email
      role: payload.role,                     // Rôle
      must_set_password: payload.must_set_password, // Flag "première connexion"
    };
  }
}
