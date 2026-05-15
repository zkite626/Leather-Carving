"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAICompatProvider = void 0;
const common_1 = require("@nestjs/common");
const base_ai_provider_1 = require("./base-ai.provider");
class OpenAICompatProvider extends base_ai_provider_1.BaseAIProvider {
    config;
    logger = new common_1.Logger(OpenAICompatProvider.name);
    constructor(config) {
        super();
        this.config = config;
    }
    async *chat(messages, options) {
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
        if (!reader)
            throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: '))
                    continue;
                const data = trimmed.slice(6);
                if (data === '[DONE]')
                    return;
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content)
                        yield content;
                }
                catch {
                }
            }
        }
    }
    generateImage() {
        throw new Error('Image generation not supported by OpenAI-compatible provider');
    }
    async testConnection() {
        try {
            const response = await fetch(`${this.config.baseUrl}/models`, {
                headers: { Authorization: `Bearer ${this.config.apiKey}` },
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
exports.OpenAICompatProvider = OpenAICompatProvider;
//# sourceMappingURL=openai-compat.provider.js.map