import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AIConfigService } from './ai-config.service';
import { BaseAIProvider, ChatMessage } from './providers/base-ai.provider';
import { OpenAICompatProvider } from './providers/openai-compat.provider';
import { ImageGenProvider } from './providers/image-gen.provider';
import { RedisService } from '../redis/redis.service';
import {
  LEARNING_ASSISTANT_PROMPT,
  PATTERN_GENERATION_PROMPT,
  RECOMMEND_PROMPT,
} from './prompts';

const CHAT_HISTORY_TTL = 1800; // 30 minutes
const CHAT_HISTORY_PREFIX = 'ai_chat:';
const MAX_HISTORY_MESSAGES = 20;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly configService: AIConfigService,
    private readonly redis: RedisService,
  ) {}

  private async getProvider(capability: string): Promise<BaseAIProvider> {
    const config = await this.configService.getConfigByCapability(capability);
    if (!config) {
      throw new ServiceUnavailableException(
        `No active AI model configured for capability: ${capability}`,
      );
    }

    if (config.providerType === 'openai_compat') {
      return new OpenAICompatProvider({
        baseUrl: config.baseUrl!,
        apiKey: config.apiKey!,
        modelName: config.modelName,
        extraParams: config.extraParams as Record<string, any> | undefined,
      });
    }

    if (capability === 'image_gen') {
      return new ImageGenProvider({
        baseUrl: config.baseUrl!,
        apiKey: config.apiKey!,
        modelName: config.modelName,
        extraParams: config.extraParams as Record<string, any> | undefined,
      });
    }

    throw new ServiceUnavailableException(
      `Unsupported provider type: ${config.providerType}`,
    );
  }

  async *chat(params: {
    message: string;
    sessionId?: string;
    context?: string;
    userId: string;
  }): AsyncGenerator<string> {
    const { message, sessionId, context, userId } = params;
    const historyKey = `${CHAT_HISTORY_PREFIX}${sessionId || userId}`;

    // Get conversation history
    let history: ChatMessage[] = [];
    try {
      const cached = await this.redis.get(historyKey);
      if (cached) history = JSON.parse(cached) as ChatMessage[];
    } catch {
      // Redis unavailable
    }

    // Build messages array
    const systemPrompt = context
      ? `${LEARNING_ASSISTANT_PROMPT.system}\n\n${LEARNING_ASSISTANT_PROMPT.contextTemplate.replace('{{context}}', context)}`
      : LEARNING_ASSISTANT_PROMPT.system;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-MAX_HISTORY_MESSAGES),
      { role: 'user', content: message },
    ];

    // Stream response
    const provider = await this.getProvider('chat');
    let fullResponse = '';

    try {
      for await (const chunk of provider.chat(messages)) {
        fullResponse += chunk;
        yield chunk;
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`AI chat error: ${errMsg}`);
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable',
      );
    }

    // Save to history (sliding window)
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: fullResponse });

    // Trim history
    if (history.length > MAX_HISTORY_MESSAGES) {
      history = history.slice(-MAX_HISTORY_MESSAGES);
    }

    try {
      await this.redis.set(
        historyKey,
        JSON.stringify(history),
        CHAT_HISTORY_TTL,
      );
    } catch {
      // Redis unavailable
    }
  }

  async generatePattern(params: {
    prompt: string;
    style?: string;
    size?: string;
  }): Promise<string> {
    const { prompt, style, size } = params;

    const styleDesc =
      style &&
      PATTERN_GENERATION_PROMPT.styles[
        style as keyof typeof PATTERN_GENERATION_PROMPT.styles
      ]
        ? PATTERN_GENERATION_PROMPT.styles[
            style as keyof typeof PATTERN_GENERATION_PROMPT.styles
          ]
        : '';

    const fullPrompt = styleDesc
      ? `${PATTERN_GENERATION_PROMPT.system}\n${styleDesc}\n\n用户需求：${prompt}`
      : `${PATTERN_GENERATION_PROMPT.system}\n\n用户需求：${prompt}`;

    const provider = await this.getProvider('image_gen');
    const imageUrl = await provider.generateImage(fullPrompt, {
      size: (size as '512x512' | '1024x1024') || '1024x1024',
    });

    return imageUrl;
  }

  async recommendCourses(params: {
    userId: string;
    preferences?: string;
    limit?: number;
  }): Promise<string> {
    const { preferences, limit = 5 } = params;
    const messages: ChatMessage[] = [
      { role: 'system', content: RECOMMEND_PROMPT.courses },
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

  async recommendProducts(params: {
    userId: string;
    preferences?: string;
    limit?: number;
  }): Promise<string> {
    const { preferences, limit = 5 } = params;
    const messages: ChatMessage[] = [
      { role: 'system', content: RECOMMEND_PROMPT.products },
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
}
