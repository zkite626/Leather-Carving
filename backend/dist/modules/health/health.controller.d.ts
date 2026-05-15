import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
interface HealthCheckResult {
    status: string;
    timestamp: string;
    services: {
        database: ServiceStatus;
        redis: ServiceStatus;
    };
}
interface ServiceStatus {
    status: string;
    latencyMs: number;
}
export declare class HealthController {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    check(): Promise<HealthCheckResult>;
    private checkDatabase;
    private checkRedis;
}
export {};
