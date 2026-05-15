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
exports.SystemSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const system_settings_service_1 = require("./system-settings.service");
const mail_service_1 = require("./mail.service");
const smtp_dto_1 = require("./dto/smtp.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SystemSettingsController = class SystemSettingsController {
    settingsService;
    mailService;
    constructor(settingsService, mailService) {
        this.settingsService = settingsService;
        this.mailService = mailService;
    }
    async getSmtp() {
        return this.settingsService.getSmtpConfig();
    }
    async updateSmtp(dto) {
        const result = await this.settingsService.updateSmtpConfig(dto);
        this.mailService.resetTransporter();
        return result;
    }
    async verifySmtp() {
        return this.mailService.verifyConnection();
    }
};
exports.SystemSettingsController = SystemSettingsController;
__decorate([
    (0, common_1.Get)('smtp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get SMTP config' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "getSmtp", null);
__decorate([
    (0, common_1.Put)('smtp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update SMTP config' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [smtp_dto_1.SmtpConfigDto]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "updateSmtp", null);
__decorate([
    (0, common_1.Post)('smtp/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Test SMTP connection' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "verifySmtp", null);
exports.SystemSettingsController = SystemSettingsController = __decorate([
    (0, swagger_1.ApiTags)('System Settings'),
    (0, common_1.Controller)('system-settings'),
    __metadata("design:paramtypes", [system_settings_service_1.SystemSettingsService,
        mail_service_1.MailService])
], SystemSettingsController);
//# sourceMappingURL=system-settings.controller.js.map