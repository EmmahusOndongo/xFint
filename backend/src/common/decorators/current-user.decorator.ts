import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Interface représentant les informations extraites du JWT
export interface JwtUser {
  sub: string; // Identifiant unique de l'utilisateur (souvent l'ID en base)
  email: string; // Adresse email de l'utilisateur
  role: 'EMPLOYEE' | 'MANAGER' | 'ACCOUNTING'; // Rôle de l'utilisateur
  must_set_password?: boolean; // Indique si l'utilisateur doit définir un mot de passe (optionnel)
}

// Décorateur personnalisé pour récupérer l'utilisateur courant depuis la requête
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    // On récupère l'objet "request" de l'exécution HTTP
    const req = ctx.switchToHttp().getRequest();

    // On retourne l'utilisateur injecté dans la requête par le middleware/auth guard
    return req.user as JwtUser | undefined;
  }
);
