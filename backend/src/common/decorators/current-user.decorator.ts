import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  sub: string; email: string; role: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING'; must_set_password?: boolean;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtUser | undefined;
  }
);
