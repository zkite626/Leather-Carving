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
exports.PatternGenerateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PatternGenerateDto {
    prompt;
    style;
    size;
}
exports.PatternGenerateDto = PatternGenerateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '以蝴蝶和花卉为主题的壮锦纹样' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], PatternGenerateDto.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['zhuangjin', 'yaozu', 'karst', 'modern'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['zhuangjin', 'yaozu', 'karst', 'modern']),
    __metadata("design:type", String)
], PatternGenerateDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['512x512', '1024x1024'], default: '1024x1024' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['512x512', '1024x1024']),
    __metadata("design:type", String)
], PatternGenerateDto.prototype, "size", void 0);
//# sourceMappingURL=pattern-generate.dto.js.map