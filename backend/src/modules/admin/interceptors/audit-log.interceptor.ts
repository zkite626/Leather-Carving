import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface RequestWithUser extends Request {
  user?: { sub: string; email: string; role: string };
}

const AUDIT_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const AUDIT_PATHS = [
  '/admin/users',
  '/admin/content',
  '/admin/banners',
  '/admin/ai-configs',
  '/admin/orders',
];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, path, ip, headers } = request;
    const body = request.body as Prisma.InputJsonValue | undefined;

    if (
      !AUDIT_METHODS.includes(method) ||
      !AUDIT_PATHS.some((p) => path.startsWith(p))
    ) {
      return next.handle();
    }

    const userId = request.user?.sub;
    const userAgent = headers['user-agent'] ?? '';
    const clientIp = ip ?? (headers['x-forwarded-for'] as string) ?? 'unknown';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const action = this.buildAction(method, path);
          void this.prisma.auditLog
            .create({
              data: {
                userId,
                action,
                entityType: this.extractEntityType(path),
                entityId: this.extractEntityId(path),
                newData:
                  body && Object.keys(body).length > 0 ? body : undefined,
                ip: clientIp,
                userAgent: userAgent.substring(0, 500),
              },
            })
            .catch((err: unknown) => {
              this.logger.error('Failed to create audit log', err);
            });

          this.logger.debug(
            `Audit: ${action} by ${userId} (${Date.now() - startTime}ms)`,
          );
        },
        error: () => {
          // Still log failed attempts
          const action = `FAIL:${this.buildAction(method, path)}`;
          void this.prisma.auditLog
            .create({
              data: {
                userId,
                action,
                entityType: this.extractEntityType(path),
                entityId: this.extractEntityId(path),
                newData:
                  body && Object.keys(body).length > 0 ? body : undefined,
                ip: clientIp,
                userAgent: userAgent.substring(0, 500),
              },
            })
            .catch(() => {});
        },
      }),
    );
  }

  private buildAction(method: string, path: string): string {
    const resource = path.replace('/api/v1/admin/', '').split('/')[0];
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };
    return `${actionMap[method] ?? method}:${resource}`;
  }

  private extractEntityType(path: string): string {
    return path.replace('/api/v1/admin/', '').split('/')[0];
  }

  private extractEntityId(path: string): string | undefined {
    const segments = path.replace('/api/v1/admin/', '').split('/');
    // Return the last segment if it looks like a UUID
    const last = segments[segments.length - 1];
    if (last && /^[0-9a-f-]{36}$/i.test(last)) return last;
    return undefined;
  }
}
