import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    private readonly logger;
    private connected;
    private readonly memoryStore;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isConnected(): boolean;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    expire(key: string, ttlSeconds: number): Promise<void>;
    getClient(): Redis | null;
}
