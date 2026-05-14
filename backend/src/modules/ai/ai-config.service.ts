import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async createConfig(data: Record<string, unknown>) {
    const config = await this.prisma.aiModelConfig.create({
      data: {
        capability: data.capability as string,
        providerType: data.providerType as string,
        displayName: data.displayName as string,
        baseUrl: (data.baseUrl as string) ?? null,
        apiKey: (data.apiKey as string) ?? null,
        modelName: data.modelName as string,
        isActive: (data.isActive as boolean) ?? true,
        extraParams: (data.extraParams as Prisma.InputJsonValue) ?? undefined,
      },
    });

    await this.invalidateCache(config.capability);
    this.logger.log(`AI config created: ${config.id} (${config.capability})`);
    return config;
  }

  async updateConfig(id: string, data: Record<string, unknown>) {
    const existing = await this.prisma.aiModelConfig.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('AI config not found');

    const updated = await this.prisma.aiModelConfig.update({
      where: { id },
      data: {
        ...(data.capability !== undefined && {
          capability: data.capability as string,
        }),
        ...(data.providerType !== undefined && {
          providerType: data.providerType as string,
        }),
        ...(data.displayName !== undefined && {
          displayName: data.displayName as string,
        }),
        ...(data.baseUrl !== undefined && {
          baseUrl: (data.baseUrl as string) || null,
        }),
        ...(data.apiKey !== undefined && {
          apiKey: (data.apiKey as string) || null,
        }),
        ...(data.modelName !== undefined && {
          modelName: data.modelName as string,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive as boolean,
        }),
        ...(data.extraParams !== undefined && {
          extraParams: data.extraParams as Prisma.InputJsonValue,
        }),
      },
    });

    await this.invalidateCache(existing.capability);
    this.logger.log(`AI config updated: ${id}`);
    return updated;
  }

  async deleteConfig(id: string) {
    const existing = await this.prisma.aiModelConfig.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('AI config not found');

    await this.prisma.aiModelConfig.delete({ where: { id } });
    await this.invalidateCache(existing.capability);
    this.logger.log(`AI config deleted: ${id}`);
  }

  async testConnectivity(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const config = await this.prisma.aiModelConfig.findUnique({
      where: { id },
    });
    if (!config) throw new NotFoundException('AI config not found');

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '连接失败';
      return { success: false, message };
    }
  }

  async invalidateCache(capability?: string) {
    try {
      if (capability) {
        await this.redis.del(`${CACHE_PREFIX}${capability}`);
      } else {
        const configs = await this.prisma.aiModelConfig.findMany({
          select: { capability: true },
        });
        for (const c of configs) {
          await this.redis.del(`${CACHE_PREFIX}${c.capability}`);
        }
      }
    } catch {
      // Redis unavailable
    }
  }
}
