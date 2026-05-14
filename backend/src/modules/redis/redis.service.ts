import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);
  private connected = false;
  private readonly memoryStore = new Map<
    string,
    { value: string; expiresAt?: number }
  >();

  async onModuleInit(): Promise<void> {
    const host = process.env.REDIS_HOST;
    if (!host) {
      this.logger.warn(
        'REDIS_HOST not set — running without Redis (in-memory fallback)',
      );
      return;
    }

    try {
      this.client = new Redis({
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Redis connection failed: ${message} — falling back to in-memory store`,
      );
      this.client = null;
      this.connected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async get(key: string): Promise<string | null> {
    if (this.connected && this.client) {
      return this.client.get(key);
    }
    // In-memory fallback
    const entry = this.memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.connected && this.client) {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
      return;
    }
    // In-memory fallback
    this.memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.connected && this.client) {
      await this.client.del(key);
      return;
    }
    this.memoryStore.delete(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (this.connected && this.client) {
      await this.client.expire(key, ttlSeconds);
      return;
    }
    const entry = this.memoryStore.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }
}
