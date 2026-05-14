export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ImageOptions {
  size?: '512x512' | '1024x1024';
  style?: string;
}

export abstract class BaseAIProvider {
  abstract chat(
    messages: ChatMessage[],
    options?: ChatOptions,
  ): AsyncGenerator<string>;
  abstract generateImage(
    prompt: string,
    options?: ImageOptions,
  ): Promise<string>;
  abstract testConnection(): Promise<boolean>;
}
