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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const address_service_1 = require("./address.service");
const create_address_dto_1 = require("./dto/create-address.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AddressController = class AddressController {
    addressService;
    constructor(addressService) {
        this.addressService = addressService;
    }
    async findAll(userId) {
        return this.addressService.findAll(userId);
    }
    async findOne(userId, id) {
        return this.addressService.findOne(userId, id);
    }
    async create(userId, dto) {
        return this.addressService.create(userId, dto);
    }
    async update(userId, id, dto) {
        return this.addressService.update(userId, id, dto);
    }
    async remove(userId, id) {
        return this.addressService.remove(userId, id);
    }
};
exports.AddressController = AddressController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List user addresses' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get single address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_address_dto_1.CreateAddressDto]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_address_dto_1.UpdateAddressDto]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete address' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "remove", null);
exports.AddressController = AddressController = __decorate([
    (0, swagger_1.ApiTags)('Addresses'),
    (0, common_1.Controller)('shop/addresses'),
    __metadata("design:paramtypes", [address_service_1.AddressService])
], AddressController);
//# sourceMappingURL=address.controller.js.map