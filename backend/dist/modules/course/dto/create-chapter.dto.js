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
exports.ReorderChaptersDto = exports.UpdateChapterDto = exports.CreateChapterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateChapterDto {
    title;
    sortOrder;
}
exports.CreateChapterDto = CreateChapterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '章节标题' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateChapterDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序序号', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateChapterDto.prototype, "sortOrder", void 0);
class UpdateChapterDto {
    title;
    sortOrder;
}
exports.UpdateChapterDto = UpdateChapterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '章节标题' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateChapterDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序序号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateChapterDto.prototype, "sortOrder", void 0);
class ReorderChaptersDto {
    chapterIds;
}
exports.ReorderChaptersDto = ReorderChaptersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '章节 ID 排序列表', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReorderChaptersDto.prototype, "chapterIds", void 0);
//# sourceMappingURL=create-chapter.dto.js.map