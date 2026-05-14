import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

interface RequestWithUser {
  user: {
    sub: string;
    email: string;
    role: UserRole;
  };
  params: Record<string, string>;
}

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admins can access any resource
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check if the resource userId matches the current user
    const resourceUserId = request.params['userId'] ?? request.params['id'];

    if (resourceUserId && resourceUserId !== user.sub) {
      throw new ForbiddenException('You can only access your own resources');
    }

    return true;
  }
}
