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
var AIConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const CACHE_TTL = 300;
const CACHE_PREFIX = 'ai_config:';
let AIConfigService = AIConfigService_1 = class AIConfigService {
    prisma;
    redis;
    logger = new common_1.Logger(AIConfigService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getConfigByCapability(capability) {
        const cacheKey = `${CACHE_PREFIX}${capability}`;
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached)
                return JSON.parse(cached);
        }
        catch {
        }
        const config = await this.prisma.aiModelConfig.findFirst({
            where: { capability, isActive: true },
        });
        if (!config)
            return null;
        try {
            await this.redis.set(cacheKey, JSON.stringify(config), CACHE_TTL);
        }
        catch {
        }
        return config;
    }
    async getAllConfigs() {
        return this.prisma.aiModelConfig.findMany({
            orderBy: { capability: 'asc' },
        });
    }
    async createConfig(data) {
        const config = await this.prisma.aiModelConfig.create({
            data: {
                capability: data.capability,
                providerType: data.providerType,
                displayName: data.displayName,
                baseUrl: data.baseUrl ?? null,
                apiKey: data.apiKey ?? null,
                modelName: data.modelName,
                isActive: data.isActive ?? true,
                extraParams: data.extraParams ?? undefined,
            },
        });
        await this.invalidateCache(config.capability);
        this.logger.log(`AI config created: ${config.id} (${config.capability})`);
        return config;
    }
    async updateConfig(id, data) {
        const existing = await this.prisma.aiModelConfig.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('AI config not found');
        const updated = await this.prisma.aiModelConfig.update({
            where: { id },
            data: {
                ...(data.capability !== undefined && {
                    capability: data.capability,
                }),
                ...(data.providerType !== undefined && {
                    providerType: data.providerType,
                }),
                ...(data.displayName !== undefined && {
                    displayName: data.displayName,
                }),
                ...(data.baseUrl !== undefined && {
                    baseUrl: data.baseUrl || null,
                }),
                ...(data.apiKey !== undefined && {
                    apiKey: data.apiKey || null,
                }),
                ...(data.modelName !== undefined && {
                    modelName: data.modelName,
                }),
                ...(data.isActive !== undefined && {
                    isActive: data.isActive,
                }),
                ...(data.extraParams !== undefined && {
                    extraParams: data.extraParams,
                }),
            },
        });
        await this.invalidateCache(existing.capability);
        this.logger.log(`AI config updated: ${id}`);
        return updated;
    }
    async deleteConfig(id) {
        const existing = await this.prisma.aiModelConfig.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('AI config not found');
        await this.prisma.aiModelConfig.delete({ where: { id } });
        await this.invalidateCache(existing.capability);
        this.logger.log(`AI config deleted: ${id}`);
    }
    async testConnectivity(id) {
        const config = await this.prisma.aiModelConfig.findUnique({
            where: { id },
        });
        if (!config)
            throw new common_1.NotFoundException('AI config not found');
        if (!config.apiKey || !config.baseUrl) {
            return { success: false, message: 'API Key 或 Base URL 未配置' };
        }
        try {
            const url = `${config.baseUrl.replace(/\/$/, '')}/models`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${config.apiKey}` },
                signal: AbortSignal.timeout(10000),
            });
            if (response.ok) {
                return { success: true, message: '连通性测试成功' };
            }
            return {
                success: false,
                message: `HTTP ${response.status}: ${response.statusText}`,
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : '连接失败';
            return { success: false, message };
        }
    }
    async invalidateCache(capability) {
        try {
            if (capability) {
                await this.redis.del(`${CACHE_PREFIX}${capability}`);
            }
            else {
                const configs = await this.prisma.aiModelConfig.findMany({
                    select: { capability: true },
                });
                for (const c of configs) {
                    await this.redis.del(`${CACHE_PREFIX}${c.capability}`);
                }
            }
        }
        catch {
        }
    }
};
exports.AIConfigService = AIConfigService;
exports.AIConfigService = AIConfigService = AIConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AIConfigService);
//# sourceMappingURL=ai-config.service.js.map