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
exports.UpdateAddressDto = exports.CreateAddressDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAddressDto {
    name;
    phone;
    province;
    city;
    district;
    detail;
    isDefault;
}
exports.CreateAddressDto = CreateAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient name', maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number', example: '13800138000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.Matches)(/^1[3-9]\d{9}$/, { message: 'Invalid Chinese phone number' }),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Province', maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "province", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City', maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'District', maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detailed address', maxLength: 200 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Set as default address',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAddressDto.prototype, "isDefault", void 0);
class UpdateAddressDto {
    name;
    phone;
    province;
    city;
    district;
    detail;
    isDefault;
}
exports.UpdateAddressDto = UpdateAddressDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recipient name', maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number', example: '13800138000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.Matches)(/^1[3-9]\d{9}$/, { message: 'Invalid Chinese phone number' }),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Province', maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "province", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'City', maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'District', maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Detailed address', maxLength: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set as default address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAddressDto.prototype, "isDefault", void 0);
//# sourceMappingURL=create-address.dto.js.map