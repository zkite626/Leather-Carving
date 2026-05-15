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
exports.QueryOrderDto = exports.CreateOrderDto = exports.OrderAddressInput = exports.OrderItemInput = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class OrderItemInput {
    productId;
    quantity;
}
exports.OrderItemInput = OrderItemInput;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderItemInput.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity', minimum: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderItemInput.prototype, "quantity", void 0);
class OrderAddressInput {
    name;
    phone;
    province;
    city;
    district;
    detail;
}
exports.OrderAddressInput = OrderAddressInput;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], OrderAddressInput.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], OrderAddressInput.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Province' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], OrderAddressInput.prototype, "province", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], OrderAddressInput.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'District' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], OrderAddressInput.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detail address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], OrderAddressInput.prototype, "detail", void 0);
class CreateOrderDto {
    items;
    address;
    remark;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderItemInput], description: 'Order items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemInput),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: OrderAddressInput, description: 'Shipping address' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => OrderAddressInput),
    __metadata("design:type", OrderAddressInput)
], CreateOrderDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Order remark' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "remark", void 0);
class QueryOrderDto {
    page;
    pageSize;
    status;
}
exports.QueryOrderDto = QueryOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryOrderDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryOrderDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.OrderStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus),
    __metadata("design:type", String)
], QueryOrderDto.prototype, "status", void 0);
//# sourceMappingURL=create-order.dto.js.map