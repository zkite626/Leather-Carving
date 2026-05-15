"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const system_settings_service_1 = require("./system-settings.service");
let MailService = MailService_1 = class MailService {
    settingsService;
    logger = new common_1.Logger(MailService_1.name);
    transporter = null;
    configLoaded = false;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getTransporter() {
        if (this.configLoaded && this.transporter)
            return this.transporter;
        try {
            const config = await this.settingsService.getRawSmtpConfig();
            if (!config.host || config.isActive !== 'true') {
                this.logger.warn('SMTP not configured or disabled');
                return null;
            }
            const port = Number(config.port) || 465;
            const encryption = config.encryption || 'ssl';
            this.transporter = nodemailer.createTransport({
                host: config.host,
                port,
                secure: encryption === 'ssl',
                auth: config.username
                    ? { user: config.username, pass: config.password }
                    : undefined,
                tls: encryption === 'tls' ? { rejectUnauthorized: false } : undefined,
            });
            this.configLoaded = true;
            return this.transporter;
        }
        catch (err) {
            this.logger.error('Failed to create SMTP transporter', err);
            return null;
        }
    }
    resetTransporter() {
        this.transporter = null;
        this.configLoaded = false;
    }
    async sendMail(options) {
        const transporter = await this.getTransporter();
        if (!transporter) {
            this.logger.warn('Cannot send email: SMTP not available');
            return false;
        }
        try {
            const config = await this.settingsService.getRawSmtpConfig();
            const from = config.fromName
                ? `"${config.fromName}" <${config.fromAddress}>`
                : config.fromAddress;
            await transporter.sendMail({
                from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${options.to}`, err);
            return false;
        }
    }
    async verifyConnection() {
        const transporter = await this.getTransporter();
        if (!transporter) {
            return { success: false, message: 'SMTP 未配置或未启用' };
        }
        try {
            await transporter.verify();
            return { success: true, message: 'SMTP 连接成功' };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : '连接失败';
            return { success: false, message: `SMTP 连接失败: ${msg}` };
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [system_settings_service_1.SystemSettingsService])
], MailService);
//# sourceMappingURL=mail.service.js.map