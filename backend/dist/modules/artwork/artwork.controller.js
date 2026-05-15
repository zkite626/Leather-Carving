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
exports.ArtworkController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const artwork_service_1 = require("./artwork.service");
const create_artwork_dto_1 = require("./dto/create-artwork.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ArtworkController = class ArtworkController {
    artworkService;
    constructor(artworkService) {
        this.artworkService = artworkService;
    }
    async findAll(query) {
        return this.artworkService.findAll(query);
    }
    async findMy(userId, query) {
        return this.artworkService.findByUser(userId, query);
    }
    async findOne(id) {
        return this.artworkService.findOne(id, true);
    }
    async getRelated(id) {
        return this.artworkService.getRelated(id);
    }
    async create(userId, dto) {
        return this.artworkService.create(userId, dto);
    }
    async addImages(id, userId, body) {
        return this.artworkService.addImages(id, userId, body.imageUrls);
    }
    async reorderImages(id, userId, body) {
        return this.artworkService.reorderImages(id, userId, body.imageIds);
    }
    async setCover(id, imageId, userId) {
        return this.artworkService.setCoverImage(id, userId, imageId);
    }
    async deleteImage(id, imageId, userId) {
        return this.artworkService.deleteImage(id, userId, imageId);
    }
    async submitForReview(id, userId) {
        return this.artworkService.submitForReview(id, userId);
    }
    async update(id, userId, dto) {
        return this.artworkService.update(id, userId, dto);
    }
    async remove(id, userId) {
        return this.artworkService.remove(id, userId);
    }
};
exports.ArtworkController = ArtworkController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List published artworks (gallery)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_artwork_dto_1.QueryArtworkDto]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my artworks' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_artwork_dto_1.QueryArtworkDto]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get artwork detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/related'),
    (0, swagger_1.ApiOperation)({ summary: 'Get related artworks' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "getRelated", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create artwork' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_artwork_dto_1.CreateArtworkDto]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add images to artwork' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "addImages", null);
__decorate([
    (0, common_1.Patch)(':id/images/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder artwork images' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "reorderImages", null);
__decorate([
    (0, common_1.Post)(':id/images/:imageId/cover'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set image as cover' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('imageId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "setCover", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete artwork image' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('imageId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit artwork for review' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update artwork' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_artwork_dto_1.UpdateArtworkDto]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete artwork (soft)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArtworkController.prototype, "remove", null);
exports.ArtworkController = ArtworkController = __decorate([
    (0, swagger_1.ApiTags)('Artworks'),
    (0, common_1.Controller)('artworks'),
    __metadata("design:paramtypes", [artwork_service_1.ArtworkService])
], ArtworkController);
//# sourceMappingURL=artwork.controller.js.map