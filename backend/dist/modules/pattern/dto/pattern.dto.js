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
exports.QueryPatternDto = exports.UpdatePatternDto = exports.CreatePatternDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePatternDto {
    name;
    category;
    imageUrl;
    thumbnailUrl;
    description;
    origin;
    tags;
}
exports.CreatePatternDto = CreatePatternDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '壮锦云纹' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePatternDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '壮锦' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePatternDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'http://minio/patterns/zhuangjin-cloud.webp' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePatternDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePatternDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePatternDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '广西壮族自治区' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePatternDto.prototype, "origin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['传统', '壮锦'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePatternDto.prototype, "tags", void 0);
class UpdatePatternDto {
    name;
    category;
    imageUrl;
    thumbnailUrl;
    description;
    origin;
    tags;
}
exports.UpdatePatternDto = UpdatePatternDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdatePatternDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePatternDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePatternDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePatternDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePatternDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePatternDto.prototype, "origin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePatternDto.prototype, "tags", void 0);
class QueryPatternDto {
    page;
    pageSize;
    category;
    keyword;
}
exports.QueryPatternDto = QueryPatternDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryPatternDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryPatternDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category filter: 壮锦/瑶族/喀斯特/现代',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPatternDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPatternDto.prototype, "keyword", void 0);
//# sourceMappingURL=pattern.dto.js.map