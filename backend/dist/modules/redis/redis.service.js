"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    client = null;
    logger = new common_1.Logger(RedisService_1.name);
    connected = false;
    memoryStore = new Map();
    async onModuleInit() {
        const host = process.env.REDIS_HOST;
        if (!host) {
            this.logger.warn('REDIS_HOST not set — running without Redis (in-memory fallback)');
            return;
        }
        try {
            this.client = new ioredis_1.default({
                host,
                port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
                lazyConnect: true,
                connectTimeout: 3000,
                maxRetriesPerRequest: 1,
            });
            await this.client.connect();
            this.connected = true;
            this.logger.log('Redis connected successfully');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Redis connection failed: ${message} — falling back to in-memory store`);
            this.client = null;
            this.connected = false;
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    isConnected() {
        return this.connected;
    }
    async get(key) {
        if (this.connected && this.client) {
            return this.client.get(key);
        }
        const entry = this.memoryStore.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.memoryStore.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        if (this.connected && this.client) {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, value);
            }
            return;
        }
        this.memoryStore.set(key, {
            value,
            expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
        });
    }
    async del(key) {
        if (this.connected && this.client) {
            await this.client.del(key);
            return;
        }
        this.memoryStore.delete(key);
    }
    async expire(key, ttlSeconds) {
        if (this.connected && this.client) {
            await this.client.expire(key, ttlSeconds);
            return;
        }
        const entry = this.memoryStore.get(key);
        if (entry) {
            entry.expiresAt = Date.now() + ttlSeconds * 1000;
        }
    }
    getClient() {
        return this.client;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map