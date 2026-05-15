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
exports.CreatePostDto = exports.PostType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PostType;
(function (PostType) {
    PostType["DISCUSSION"] = "DISCUSSION";
    PostType["SHOWCASE"] = "SHOWCASE";
    PostType["QUESTION"] = "QUESTION";
    PostType["TUTORIAL"] = "TUTORIAL";
    PostType["CHALLENGE"] = "CHALLENGE";
})(PostType || (exports.PostType = PostType = {}));
class CreatePostDto {
    type;
    title;
    content;
    images;
    tags;
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PostType, default: PostType.DISCUSSION }),
    (0, class_validator_1.IsEnum)(PostType),
    __metadata("design:type", String)
], CreatePostDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '壮锦纹样的历史与演变' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePostDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '# 壮锦纹样\n\n壮锦是中国四大名锦之一...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreatePostDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['https://example.com/img1.jpg'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['壮锦', '纹样', '非遗'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "tags", void 0);
//# sourceMappingURL=create-post.dto.js.map