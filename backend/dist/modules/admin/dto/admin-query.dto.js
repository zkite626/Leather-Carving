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
exports.ProductQueryDto = exports.CourseQueryDto = exports.DashboardQueryDto = exports.FinanceQueryDto = exports.AuditLogQueryDto = exports.ContentReviewQueryDto = exports.OrderQueryDto = exports.UserQueryDto = exports.AdminPaginationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AdminPaginationDto {
    page = 1;
    pageSize = 20;
}
exports.AdminPaginationDto = AdminPaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdminPaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AdminPaginationDto.prototype, "pageSize", void 0);
class UserQueryDto extends AdminPaginationDto {
    keyword;
    role;
    status;
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    __metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    __metadata("design:type", String)
], UserQueryDto.prototype, "status", void 0);
class OrderQueryDto extends AdminPaginationDto {
    status;
    keyword;
}
exports.OrderQueryDto = OrderQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.OrderStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "keyword", void 0);
class ContentReviewQueryDto extends AdminPaginationDto {
    status;
    type;
}
exports.ContentReviewQueryDto = ContentReviewQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['REVIEWING', 'PUBLISHED', 'REJECTED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentReviewQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['course', 'artwork', 'post'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentReviewQueryDto.prototype, "type", void 0);
class AuditLogQueryDto extends AdminPaginationDto {
    action;
    userId;
    startDate;
    endDate;
}
exports.AuditLogQueryDto = AuditLogQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "endDate", void 0);
class FinanceQueryDto extends AdminPaginationDto {
    startDate;
    endDate;
}
exports.FinanceQueryDto = FinanceQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinanceQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinanceQueryDto.prototype, "endDate", void 0);
class DashboardQueryDto {
    period;
}
exports.DashboardQueryDto = DashboardQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['day', 'week', 'month'], default: 'day' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "period", void 0);
class CourseQueryDto extends AdminPaginationDto {
    keyword;
    status;
    level;
}
exports.CourseQueryDto = CourseQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['DRAFT', 'REVIEWING', 'PUBLISHED', 'ARCHIVED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseQueryDto.prototype, "level", void 0);
class ProductQueryDto extends AdminPaginationDto {
    keyword;
    status;
}
exports.ProductQueryDto = ProductQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'SOLD_OUT'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "status", void 0);
//# sourceMappingURL=admin-query.dto.js.map