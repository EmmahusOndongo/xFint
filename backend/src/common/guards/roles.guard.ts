import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Le Reflector permet de lire les métadonnées définies par les décorateurs (ici : @Roles)
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Récupère les rôles requis définis sur la route ou le contrôleur via le décorateur @Roles
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(), // Méthode (route)
      ctx.getClass(),   // Classe (contrôleur)
    ]);

    // S'il n'y a aucun rôle requis, on laisse passer l'accès
    if (!required || required.length === 0) return true;

    // Récupère l'utilisateur injecté dans la requête
    const { user } = ctx.switchToHttp().getRequest();

    // Vérifie si le rôle de l'utilisateur fait partie des rôles requis
    return required.includes(user?.role);
  }
}
