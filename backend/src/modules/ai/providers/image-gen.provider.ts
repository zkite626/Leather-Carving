import { Logger } from '@nestjs/common';
import {
  BaseAIProvider,
  ChatMessage,
  ChatOptions,
  ImageOptions,
} from './base-ai.provider';

interface ImageGenConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  extraParams?: Record<string, any>;
}

export class ImageGenProvider extends BaseAIProvider {
  private readonly logger = new Logger(ImageGenProvider.name);

  constructor(private readonly config: ImageGenConfig) {
    super();
  }

  async *_chat(
    _messages: ChatMessage[],
    _options?: ChatOptions,
  ): AsyncGenerator<string> {
    throw new Error('Chat not supported by image generation provider');
  }

  // Implement abstract method
  async *chat(
    _messages: ChatMessage[],
    _options?: ChatOptions,
  ): AsyncGenerator<string> {
    throw new Error('Chat not supported by image generation provider');
  }

  async generateImage(prompt: string, options?: ImageOptions): Promise<string> {
    const url = `${this.config.baseUrl}/images/generations`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.modelName,
        prompt,
        n: 1,
        size: options?.size || '1024x1024',
        response_format: 'url',
        ...(this.config.extraParams || {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Image generation error: ${response.status} - ${errorText}`,
      );
      throw new Error(`Image generation error: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.[0]?.url || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
