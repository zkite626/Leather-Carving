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
exports.FavoriteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const favorite_service_1 = require("./favorite.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FavoriteController = class FavoriteController {
    favoriteService;
    constructor(favoriteService) {
        this.favoriteService = favoriteService;
    }
    async toggle(userId, entityType, entityId) {
        return this.favoriteService.toggle(userId, entityType, entityId);
    }
    async check(userId, entityType, entityId) {
        return this.favoriteService.check(userId, entityType, entityId);
    }
    async getMyFavorites(userId, entityType, page, pageSize) {
        return this.favoriteService.getMyFavorites(userId, entityType, page, pageSize);
    }
};
exports.FavoriteController = FavoriteController;
__decorate([
    (0, common_1.Post)(':entityType/:entityId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle favorite (idempotent)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)('check/:entityType/:entityId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if favorited' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my favorites' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "getMyFavorites", null);
exports.FavoriteController = FavoriteController = __decorate([
    (0, swagger_1.ApiTags)('Favorites'),
    (0, common_1.Controller)('favorites'),
    __metadata("design:paramtypes", [favorite_service_1.FavoriteService])
], FavoriteController);
//# sourceMappingURL=favorite.controller.js.map