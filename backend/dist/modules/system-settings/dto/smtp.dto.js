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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpConfigDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SmtpConfigDto {
    host;
    port;
    username;
    password;
    fromAddress;
    fromName;
    encryption;
    isActive;
}
exports.SmtpConfigDto = SmtpConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'smtp.qq.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 465 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SmtpConfigDto.prototype, "port", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'your-email@qq.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'your-smtp-password' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'your-email@qq.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "fromAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '艺育皮韵' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "fromName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ssl', default: 'ssl' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "encryption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SmtpConfigDto.prototype, "isActive", void 0);
//# sourceMappingURL=smtp.dto.js.map