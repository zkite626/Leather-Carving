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
exports.ReorderLessonsDto = exports.UpdateLessonDto = exports.CreateLessonDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateLessonDto {
    title;
    type;
    content;
    videoUrl;
    duration;
    isFreePreview;
    sortOrder;
}
exports.CreateLessonDto = CreateLessonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '课时标题' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.LessonType,
        description: '课时类型',
        default: client_1.LessonType.VIDEO,
    }),
    (0, class_validator_1.IsEnum)(client_1.LessonType),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '图文内容（Markdown）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视频 URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '时长（秒）', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否免费试看', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isFreePreview", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序序号', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "sortOrder", void 0);
class UpdateLessonDto {
    title;
    type;
    content;
    videoUrl;
    duration;
    isFreePreview;
    sortOrder;
}
exports.UpdateLessonDto = UpdateLessonDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '课时标题' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.LessonType, description: '课时类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LessonType),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '图文内容（Markdown）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视频 URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '时长（秒）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否免费试看' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isFreePreview", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序序号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "sortOrder", void 0);
class ReorderLessonsDto {
    lessonIds;
}
exports.ReorderLessonsDto = ReorderLessonsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '课时 ID 排序列表', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReorderLessonsDto.prototype, "lessonIds", void 0);
//# sourceMappingURL=create-lesson.dto.js.map