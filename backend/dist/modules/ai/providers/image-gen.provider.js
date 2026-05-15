"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenProvider = void 0;
const common_1 = require("@nestjs/common");
const base_ai_provider_1 = require("./base-ai.provider");
class ImageGenProvider extends base_ai_provider_1.BaseAIProvider {
    config;
    logger = new common_1.Logger(ImageGenProvider.name);
    constructor(config) {
        super();
        this.config = config;
    }
    chat() {
        throw new Error('Chat not supported by image generation provider');
    }
    async generateImage(prompt, options) {
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
            this.logger.error(`Image generation error: ${response.status} - ${errorText}`);
            throw new Error(`Image generation error: ${response.status}`);
        }
        const result = (await response.json());
        return result.data?.[0]?.url || '';
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
exports.ImageGenProvider = ImageGenProvider;
//# sourceMappingURL=image-gen.provider.js.map