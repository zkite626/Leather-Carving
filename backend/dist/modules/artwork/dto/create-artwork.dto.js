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
exports.QueryArtworkDto = exports.UpdateArtworkDto = exports.CreateArtworkDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateArtworkDto {
    title;
    description;
    category;
    techniques;
    materials;
    tags;
    story;
}
exports.CreateArtworkDto = CreateArtworkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '壮锦纹样皮雕作品' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '以壮锦传统纹样为灵感创作的皮雕作品' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '壮锦' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['镂刻', '印花'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateArtworkDto.prototype, "techniques", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['牛皮', '羊皮'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateArtworkDto.prototype, "materials", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['tag1', 'tag2'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateArtworkDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '创作故事 (Markdown)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "story", void 0);
class UpdateArtworkDto {
    title;
    description;
    category;
    techniques;
    materials;
    tags;
    story;
}
exports.UpdateArtworkDto = UpdateArtworkDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateArtworkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateArtworkDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateArtworkDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateArtworkDto.prototype, "techniques", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateArtworkDto.prototype, "materials", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateArtworkDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateArtworkDto.prototype, "story", void 0);
class QueryArtworkDto {
    page;
    pageSize;
    category;
    keyword;
    techniques;
    sortBy;
}
exports.QueryArtworkDto = QueryArtworkDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryArtworkDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryArtworkDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryArtworkDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryArtworkDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryArtworkDto.prototype, "techniques", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryArtworkDto.prototype, "sortBy", void 0);
//# sourceMappingURL=create-artwork.dto.js.map