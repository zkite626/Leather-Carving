import { PrismaService } from '../prisma/prisma.service';
import { AuditLogQueryDto } from './dto';
import { Prisma } from '@prisma/client';
export declare class AdminAuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAuditLogs(query: AuditLogQueryDto): Promise<{
        items: ({
            user: {
                id: string;
                email: string;
                nickname: string;
                avatar: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            entityType: string;
            entityId: string | null;
            action: string;
            oldData: Prisma.JsonValue | null;
            newData: Prisma.JsonValue | null;
            ip: string | null;
            userAgent: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
}
