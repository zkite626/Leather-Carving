import { AIService } from './ai.service';
import { AIConfigService } from './ai-config.service';
import { ChatDto } from './dto/chat.dto';
import { PatternGenerateDto } from './dto/pattern-generate.dto';
import { RecommendDto } from './dto/recommend.dto';
export declare class AIController {
    private readonly aiService;
    private readonly aiConfigService;
    constructor(aiService: AIService, aiConfigService: AIConfigService);
    getConfigs(): Promise<{
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
        extraParams: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    createConfig(dto: Record<string, unknown>): Promise<{
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
        extraParams: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateConfig(id: string, dto: Record<string, unknown>): Promise<{
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
        extraParams: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    deleteConfig(id: string): Promise<{
        message: string;
    }>;
    testConfig(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    chat(userId: string, dto: ChatDto, res: import('express').Response): Promise<void>;
    generatePattern(userId: string, dto: PatternGenerateDto): Promise<{
        imageUrl: string;
        prompt: string;
        style: string | undefined;
    }>;
    recommendCourses(userId: string, dto: RecommendDto): Promise<{
        recommendations: string;
    }>;
    recommendProducts(userId: string, dto: RecommendDto): Promise<{
        recommendations: string;
    }>;
}
