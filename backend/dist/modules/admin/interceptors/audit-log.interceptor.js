"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditLogInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../../prisma/prisma.service");
const AUDIT_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const AUDIT_PATHS = [
    '/admin/users',
    '/admin/content',
    '/admin/banners',
    '/admin/ai-configs',
    '/admin/orders',
];
let AuditLogInterceptor = AuditLogInterceptor_1 = class AuditLogInterceptor {
    prisma;
    logger = new common_1.Logger(AuditLogInterceptor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, path, ip, headers } = request;
        const body = request.body;
        if (!AUDIT_METHODS.includes(method) ||
            !AUDIT_PATHS.some((p) => path.startsWith(p))) {
            return next.handle();
        }
        const userId = request.user?.sub;
        const userAgent = headers['user-agent'] ?? '';
        const clientIp = ip ?? headers['x-forwarded-for'] ?? 'unknown';
        const startTime = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const action = this.buildAction(method, path);
                void this.prisma.auditLog
                    .create({
                    data: {
                        userId,
                        action,
                        entityType: this.extractEntityType(path),
                        entityId: this.extractEntityId(path),
                        newData: body && Object.keys(body).length > 0 ? body : undefined,
                        ip: clientIp,
                        userAgent: userAgent.substring(0, 500),
                    },
                })
                    .catch((err) => {
                    this.logger.error('Failed to create audit log', err);
                });
                this.logger.debug(`Audit: ${action} by ${userId} (${Date.now() - startTime}ms)`);
            },
            error: () => {
                const action = `FAIL:${this.buildAction(method, path)}`;
                void this.prisma.auditLog
                    .create({
                    data: {
                        userId,
                        action,
                        entityType: this.extractEntityType(path),
                        entityId: this.extractEntityId(path),
                        newData: body && Object.keys(body).length > 0 ? body : undefined,
                        ip: clientIp,
                        userAgent: userAgent.substring(0, 500),
                    },
                })
                    .catch(() => { });
            },
        }));
    }
    buildAction(method, path) {
        const resource = path.replace('/api/v1/admin/', '').split('/')[0];
        const actionMap = {
            POST: 'CREATE',
            PATCH: 'UPDATE',
            PUT: 'UPDATE',
            DELETE: 'DELETE',
        };
        return `${actionMap[method] ?? method}:${resource}`;
    }
    extractEntityType(path) {
        return path.replace('/api/v1/admin/', '').split('/')[0];
    }
    extractEntityId(path) {
        const segments = path.replace('/api/v1/admin/', '').split('/');
        const last = segments[segments.length - 1];
        if (last && /^[0-9a-f-]{36}$/i.test(last))
            return last;
        return undefined;
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map