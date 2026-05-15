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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let HealthController = class HealthController {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async check() {
        const dbStatus = await this.checkDatabase();
        const redisStatus = await this.checkRedis();
        const allHealthy = dbStatus.status === 'healthy' && redisStatus.status === 'healthy';
        return {
            status: allHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                redis: redisStatus,
            },
        };
    }
    async checkDatabase() {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return { status: 'healthy', latencyMs: Date.now() - start };
        }
        catch {
            return { status: 'unhealthy', latencyMs: Date.now() - start };
        }
    }
    async checkRedis() {
        const start = Date.now();
        try {
            const client = this.redis.getClient();
            if (!client) {
                return { status: 'degraded', latencyMs: Date.now() - start };
            }
            await client.ping();
            return { status: 'healthy', latencyMs: Date.now() - start };
        }
        catch {
            return { status: 'unhealthy', latencyMs: Date.now() - start };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], HealthController);
//# sourceMappingURL=health.controller.js.map