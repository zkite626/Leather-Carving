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
var AdminAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminAuditService = AdminAuditService_1 = class AdminAuditService {
    prisma;
    logger = new common_1.Logger(AdminAuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAuditLogs(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {
            ...(query.action && {
                action: { contains: query.action, mode: 'insensitive' },
            }),
            ...(query.userId && { userId: query.userId }),
            ...((query.startDate || query.endDate) && {
                createdAt: {
                    ...(query.startDate && { gte: new Date(query.startDate) }),
                    ...(query.endDate && { lte: new Date(query.endDate) }),
                },
            }),
        };
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, nickname: true, email: true, avatar: true },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            items: logs,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
};
exports.AdminAuditService = AdminAuditService;
exports.AdminAuditService = AdminAuditService = AdminAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminAuditService);
//# sourceMappingURL=admin-audit.service.js.map