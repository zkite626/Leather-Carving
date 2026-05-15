import { AIConfigService } from './ai-config.service';
import { RedisService } from '../redis/redis.service';
export declare class AIService {
    private readonly configService;
    private readonly redis;
    private readonly logger;
    constructor(configService: AIConfigService, redis: RedisService);
    private getProvider;
    chat(params: {
        message: string;
        sessionId?: string;
        context?: string;
        userId: string;
    }): AsyncGenerator<string>;
    generatePattern(params: {
        prompt: string;
        style?: string;
        size?: string;
    }): Promise<string>;
    recommendCourses(params: {
        userId: string;
        preferences?: string;
        limit?: number;
    }): Promise<string>;
    recommendProducts(params: {
        userId: string;
        preferences?: string;
        limit?: number;
    }): Promise<string>;
}
