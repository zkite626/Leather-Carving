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
exports.UpdateCartDto = exports.AddToCartDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AddToCartDto {
    productId;
    quantity = 1;
}
exports.AddToCartDto = AddToCartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID', example: 'uuid-string' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddToCartDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity to add',
        minimum: 1,
        maximum: 99,
        default: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], AddToCartDto.prototype, "quantity", void 0);
class UpdateCartDto {
    quantity;
}
exports.UpdateCartDto = UpdateCartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New quantity', minimum: 1, maximum: 99 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], UpdateCartDto.prototype, "quantity", void 0);
//# sourceMappingURL=create-cart.dto.js.map