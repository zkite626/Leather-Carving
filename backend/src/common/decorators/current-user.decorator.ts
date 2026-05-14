import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestUser {
  sub: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);
