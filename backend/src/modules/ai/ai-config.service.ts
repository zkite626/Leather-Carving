import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'ai_config:';

@Injectable()
export class AIConfigService {
  private readonly logger = new Logger(AIConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getConfigByCapability(capability: string) {
    const cacheKey = `${CACHE_PREFIX}${capability}`;

    // Try cache first
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis unavailable, fall through
    }

    const config = await this.prisma.aiModelConfig.findFirst({
      where: { capability, isActive: true },
    });

    if (!config) return null;

    // Cache the config
    try {
      await this.redis.set(cacheKey, JSON.stringify(config), CACHE_TTL);
    } catch {
      // Redis unavailable
    }

    return config;
  }

  async getAllConfigs() {
    return this.prisma.aiModelConfig.findMany({
      orderBy: { capability: 'asc' },
    });
  }

  async invalidateCache(capability?: string) {
    try {
      if (capability) {
        await this.redis.del(`${CACHE_PREFIX}${capability}`);
      } else {
        // Invalidate all AI config caches
        const configs = await this.prisma.aiModelConfig.findMany({ select: { capability: true } });
        for (const c of configs) {
          await this.redis.del(`${CACHE_PREFIX}${c.capability}`);
        }
      }
    } catch {
      // Redis unavailable
    }
  }
}
