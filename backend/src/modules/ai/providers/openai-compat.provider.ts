import { Logger } from '@nestjs/common';
import { BaseAIProvider, ChatMessage, ChatOptions, ImageOptions } from './base-ai.provider';

interface AIModelConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  extraParams?: Record<string, any>;
}

export class OpenAICompatProvider extends BaseAIProvider {
  private readonly logger = new Logger(OpenAICompatProvider.name);

  constructor(private readonly config: AIModelConfig) {
    super();
  }

  async *chat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    const url = `${this.config.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        stream: true,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
        ...(this.config.extraParams || {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`AI API error: ${response.status} - ${errorText}`);
      throw new Error(`AI service error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  async generateImage(_prompt: string, _options?: ImageOptions): Promise<string> {
    throw new Error('Image generation not supported by OpenAI-compatible provider');
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
