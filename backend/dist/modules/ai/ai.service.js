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
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const ai_config_service_1 = require("./ai-config.service");
const openai_compat_provider_1 = require("./providers/openai-compat.provider");
const image_gen_provider_1 = require("./providers/image-gen.provider");
const redis_service_1 = require("../redis/redis.service");
const prompts_1 = require("./prompts");
const CHAT_HISTORY_TTL = 1800;
const CHAT_HISTORY_PREFIX = 'ai_chat:';
const MAX_HISTORY_MESSAGES = 20;
let AIService = AIService_1 = class AIService {
    configService;
    redis;
    logger = new common_1.Logger(AIService_1.name);
    constructor(configService, redis) {
        this.configService = configService;
        this.redis = redis;
    }
    async getProvider(capability) {
        const config = await this.configService.getConfigByCapability(capability);
        if (!config) {
            throw new common_1.ServiceUnavailableException(`No active AI model configured for capability: ${capability}`);
        }
        if (config.providerType === 'openai_compat') {
            return new openai_compat_provider_1.OpenAICompatProvider({
                baseUrl: config.baseUrl,
                apiKey: config.apiKey,
                modelName: config.modelName,
                extraParams: config.extraParams,
            });
        }
        if (capability === 'image_gen') {
            return new image_gen_provider_1.ImageGenProvider({
                baseUrl: config.baseUrl,
                apiKey: config.apiKey,
                modelName: config.modelName,
                extraParams: config.extraParams,
            });
        }
        throw new common_1.ServiceUnavailableException(`Unsupported provider type: ${config.providerType}`);
    }
    async *chat(params) {
        const { message, sessionId, context, userId } = params;
        const historyKey = `${CHAT_HISTORY_PREFIX}${sessionId || userId}`;
        let history = [];
        try {
            const cached = await this.redis.get(historyKey);
            if (cached)
                history = JSON.parse(cached);
        }
        catch {
        }
        const systemPrompt = context
            ? `${prompts_1.LEARNING_ASSISTANT_PROMPT.system}\n\n${prompts_1.LEARNING_ASSISTANT_PROMPT.contextTemplate.replace('{{context}}', context)}`
            : prompts_1.LEARNING_ASSISTANT_PROMPT.system;
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-MAX_HISTORY_MESSAGES),
            { role: 'user', content: message },
        ];
        const provider = await this.getProvider('chat');
        let fullResponse = '';
        try {
            for await (const chunk of provider.chat(messages)) {
                fullResponse += chunk;
                yield chunk;
            }
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`AI chat error: ${errMsg}`);
            throw new common_1.ServiceUnavailableException('AI service is temporarily unavailable');
        }
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: fullResponse });
        if (history.length > MAX_HISTORY_MESSAGES) {
            history = history.slice(-MAX_HISTORY_MESSAGES);
        }
        try {
            await this.redis.set(historyKey, JSON.stringify(history), CHAT_HISTORY_TTL);
        }
        catch {
        }
    }
    async generatePattern(params) {
        const { prompt, style, size } = params;
        const styleDesc = style &&
            prompts_1.PATTERN_GENERATION_PROMPT.styles[style]
            ? prompts_1.PATTERN_GENERATION_PROMPT.styles[style]
            : '';
        const fullPrompt = styleDesc
            ? `${prompts_1.PATTERN_GENERATION_PROMPT.system}\n${styleDesc}\n\n用户需求：${prompt}`
            : `${prompts_1.PATTERN_GENERATION_PROMPT.system}\n\n用户需求：${prompt}`;
        const provider = await this.getProvider('image_gen');
        const imageUrl = await provider.generateImage(fullPrompt, {
            size: size || '1024x1024',
        });
        return imageUrl;
    }
    async recommendCourses(params) {
        const { preferences, limit = 5 } = params;
        const messages = [
            { role: 'system', content: prompts_1.RECOMMEND_PROMPT.courses },
            {
                role: 'user',
                content: `请推荐${limit}门课程。${preferences ? `用户偏好：${preferences}` : '请推荐热门课程。'}`,
            },
        ];
        let result = '';
        const provider = await this.getProvider('chat');
        for await (const chunk of provider.chat(messages, { maxTokens: 1024 })) {
            result += chunk;
        }
        return result;
    }
    async recommendProducts(params) {
        const { preferences, limit = 5 } = params;
        const messages = [
            { role: 'system', content: prompts_1.RECOMMEND_PROMPT.products },
            {
                role: 'user',
                content: `请推荐${limit}件商品。${preferences ? `用户偏好：${preferences}` : '请推荐热门商品。'}`,
            },
        ];
        let result = '';
        const provider = await this.getProvider('chat');
        for await (const chunk of provider.chat(messages, { maxTokens: 1024 })) {
            result += chunk;
        }
        return result;
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_config_service_1.AIConfigService,
        redis_service_1.RedisService])
], AIService);
//# sourceMappingURL=ai.service.js.map