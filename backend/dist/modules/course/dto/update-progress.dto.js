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
exports.UpdateProgressDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateProgressDto {
    watchedDuration;
    lastPosition;
    isCompleted;
}
exports.UpdateProgressDto = UpdateProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '已观看时长（秒）' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateProgressDto.prototype, "watchedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '上次播放位置（秒）' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateProgressDto.prototype, "lastPosition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否标记完成' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProgressDto.prototype, "isCompleted", void 0);
//# sourceMappingURL=update-progress.dto.js.map