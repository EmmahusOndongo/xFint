import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class FirstLoginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (user?.must_set_password) {
      throw new ForbiddenException('Password must be set on first login');
    }
    return true;
  }
}
