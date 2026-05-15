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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const product_service_1 = require("./product.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async findAll(query) {
        return this.productService.findAll(query);
    }
    async getGuangxiProducts() {
        return this.productService.getGuangxiProducts();
    }
    async getHotProducts() {
        return this.productService.getHotProducts();
    }
    async getNewProducts() {
        return this.productService.getNewProducts();
    }
    async findMy(userId, query) {
        return this.productService.findByMerchant(userId, query);
    }
    async findOne(slug) {
        return this.productService.findOne(slug);
    }
    async create(userId, dto) {
        return this.productService.create(userId, dto);
    }
    async update(id, userId, dto) {
        return this.productService.update(id, userId, dto);
    }
    async remove(id, userId) {
        return this.productService.remove(id, userId);
    }
    async addImages(id, userId, dto) {
        return this.productService.addImages(id, userId, dto.imageUrls);
    }
    async reorderImages(id, userId, body) {
        return this.productService.reorderImages(id, userId, body.imageIds);
    }
    async deleteImage(id, imageId, userId) {
        return this.productService.deleteImage(id, userId, imageId);
    }
    async updateStatus(id, userId, status) {
        return this.productService.updateStatus(id, userId, status);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List products with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.QueryProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('guangxi'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Guangxi specialty products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getGuangxiProducts", null);
__decorate([
    (0, common_1.Get)('hot'),
    (0, swagger_1.ApiOperation)({ summary: 'Get hot products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getHotProducts", null);
__decorate([
    (0, common_1.Get)('new'),
    (0, swagger_1.ApiOperation)({ summary: 'Get new products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getNewProducts", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant own products' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_1.QueryProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product detail by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create product' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product (soft)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add images to product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_product_dto_1.AddProductImagesDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addImages", null);
__decorate([
    (0, common_1.Patch)(':id/images/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder product images' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "reorderImages", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product image' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('imageId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update product status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateStatus", null);
exports.ProductController = ProductController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('shop/products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map