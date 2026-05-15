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
var SystemSettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SystemSettingsService = SystemSettingsService_1 = class SystemSettingsService {
    prisma;
    logger = new common_1.Logger(SystemSettingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByCategory(category) {
        const settings = await this.prisma.systemSetting.findMany({
            where: { category },
        });
        return settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});
    }
    async upsert(category, key, value, label) {
        return this.prisma.systemSetting.upsert({
            where: { category_key: { category, key } },
            update: { value, ...(label !== undefined ? { label } : {}) },
            create: { category, key, value, label },
        });
    }
    async upsertBatch(category, entries) {
        for (const entry of entries) {
            await this.upsert(category, entry.key, entry.value, entry.label);
        }
        return this.getByCategory(category);
    }
    SMTP_KEYS = {
        host: 'SMTP 服务器',
        port: '端口',
        username: '用户名',
        password: '密码',
        fromAddress: '发件人邮箱',
        fromName: '发件人名称',
        encryption: '加密方式',
        isActive: '启用状态',
    };
    async getSmtpConfig() {
        const raw = await this.getByCategory('smtp');
        if (raw.password) {
            raw.password = '********';
        }
        return raw;
    }
    async updateSmtpConfig(dto) {
        const entries = Object.entries(dto)
            .filter(([, v]) => v !== undefined)
            .map(([key, value]) => ({
            key,
            value: String(value),
            label: this.SMTP_KEYS[key],
        }));
        await this.upsertBatch('smtp', entries);
        return this.getSmtpConfig();
    }
    async getRawSmtpConfig() {
        return this.getByCategory('smtp');
    }
};
exports.SystemSettingsService = SystemSettingsService;
exports.SystemSettingsService = SystemSettingsService = SystemSettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemSettingsService);
//# sourceMappingURL=system-settings.service.js.map