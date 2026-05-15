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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const ai_config_service_1 = require("./ai-config.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const chat_dto_1 = require("./dto/chat.dto");
const pattern_generate_dto_1 = require("./dto/pattern-generate.dto");
const recommend_dto_1 = require("./dto/recommend.dto");
let AIController = class AIController {
    aiService;
    aiConfigService;
    constructor(aiService, aiConfigService) {
        this.aiService = aiService;
        this.aiConfigService = aiConfigService;
    }
    async getConfigs() {
        return this.aiConfigService.getAllConfigs();
    }
    async createConfig(dto) {
        const result = await this.aiConfigService.createConfig(dto);
        return result;
    }
    async updateConfig(id, dto) {
        const result = await this.aiConfigService.updateConfig(id, dto);
        return result;
    }
    async deleteConfig(id) {
        await this.aiConfigService.deleteConfig(id);
        return { message: 'AI config deleted' };
    }
    async testConfig(id) {
        return this.aiConfigService.testConnectivity(id);
    }
    async chat(userId, dto, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        try {
            const generator = this.aiService.chat({
                message: dto.message,
                sessionId: dto.sessionId,
                context: dto.context,
                userId,
            });
            for await (const chunk of generator) {
                res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
            }
            res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            res.write(`data: ${JSON.stringify({ error: errMsg, done: true })}\n\n`);
        }
        res.end();
    }
    async generatePattern(userId, dto) {
        const imageUrl = await this.aiService.generatePattern({
            prompt: dto.prompt,
            style: dto.style,
            size: dto.size,
        });
        return { imageUrl, prompt: dto.prompt, style: dto.style };
    }
    async recommendCourses(userId, dto) {
        const result = await this.aiService.recommendCourses({
            userId,
            preferences: dto.preferences,
            limit: dto.limit,
        });
        return { recommendations: result };
    }
    async recommendProducts(userId, dto) {
        const result = await this.aiService.recommendProducts({
            userId,
            preferences: dto.preferences,
            limit: dto.limit,
        });
        return { recommendations: result };
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Get)('configs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all AI model configs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getConfigs", null);
__decorate([
    (0, common_1.Post)('configs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create AI model config' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Patch)('configs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update AI model config' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Delete)('configs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete AI model config' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "deleteConfig", null);
__decorate([
    (0, common_1.Post)('configs/:id/test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Test AI model connectivity' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "testConfig", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'AI chat with SSE streaming' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, chat_dto_1.ChatDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('pattern/generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI pattern image' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pattern_generate_dto_1.PatternGenerateDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generatePattern", null);
__decorate([
    (0, common_1.Post)('recommend/courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI course recommendations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recommend_dto_1.RecommendDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "recommendCourses", null);
__decorate([
    (0, common_1.Post)('recommend/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI product recommendations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recommend_dto_1.RecommendDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "recommendProducts", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AIService,
        ai_config_service_1.AIConfigService])
], AIController);
//# sourceMappingURL=ai.controller.js.map