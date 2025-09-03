import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class FirstLoginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // On récupère la requête HTTP depuis le contexte d'exécution
    const req = context.switchToHttp().getRequest();

    // L'utilisateur est injecté dans la requête par le mécanisme d'authentification (JWT guard, etc.)
    const user = req.user;

    // Si l'utilisateur doit encore définir son mot de passe,
    // on bloque l'accès et on lève une exception 403 (Forbidden)
    if (user?.must_set_password) {
      throw new ForbiddenException('Password must be set on first login');
    }

    // Sinon, l'accès est autorisé
    return true;
  }
}
