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
exports.QueryCourseDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class QueryCourseDto {
    page;
    pageSize;
    level;
    category;
    isFree;
    keyword;
    sortBy;
    sortOrder;
}
exports.QueryCourseDto = QueryCourseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryCourseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryCourseDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.CourseLevel, description: '按级别筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CourseLevel),
    __metadata("design:type", String)
], QueryCourseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '按分类筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCourseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '仅免费课程' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryCourseDto.prototype, "isFree", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词搜索' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCourseDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序字段',
        enum: ['createdAt', 'enrollCount', 'rating', 'price'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCourseDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['asc', 'desc'], default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCourseDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-course.dto.js.map