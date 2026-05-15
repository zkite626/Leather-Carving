import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export declare class AIConfigService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    getConfigByCapability(capability: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        capability: string;
        providerType: string;
        displayName: string;
        baseUrl: string | null;
        apiKey: string | null;
        modelName: string;
        extraParams: Prisma.JsonValue | null;
    } | null>;
    getAllConfigs(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        capability: string;
        providerType: string;
        displayName: string;
        baseUrl: string | null;
        apiKey: string | null;
        modelName: string;
        extraParams: Prisma.JsonValue | null;
    }[]>;
    createConfig(data: Record<string, unknown>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        capability: string;
        providerType: string;
        displayName: string;
        baseUrl: string | null;
        apiKey: string | null;
        modelName: string;
        extraParams: Prisma.JsonValue | null;
    }>;
    updateConfig(id: string, data: Record<string, unknown>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        capability: string;
        providerType: string;
        displayName: string;
        baseUrl: string | null;
        apiKey: string | null;
        modelName: string;
        extraParams: Prisma.JsonValue | null;
    }>;
    deleteConfig(id: string): Promise<void>;
    testConnectivity(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    invalidateCache(capability?: string): Promise<void>;
}
