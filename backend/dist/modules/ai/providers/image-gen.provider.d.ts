import { BaseAIProvider, ImageOptions } from './base-ai.provider';
interface ImageGenConfig {
    baseUrl: string;
    apiKey: string;
    modelName: string;
    extraParams?: Record<string, any>;
}
export declare class ImageGenProvider extends BaseAIProvider {
    private readonly config;
    private readonly logger;
    constructor(config: ImageGenConfig);
    chat(): never;
    generateImage(prompt: string, options?: ImageOptions): Promise<string>;
    testConnection(): Promise<boolean>;
}
export {};
