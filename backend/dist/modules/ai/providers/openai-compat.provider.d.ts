import { BaseAIProvider, ChatMessage, ChatOptions } from './base-ai.provider';
interface AIModelConfig {
    baseUrl: string;
    apiKey: string;
    modelName: string;
    extraParams?: Record<string, any>;
}
export declare class OpenAICompatProvider extends BaseAIProvider {
    private readonly config;
    private readonly logger;
    constructor(config: AIModelConfig);
    chat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>;
    generateImage(): never;
    testConnection(): Promise<boolean>;
}
export {};
