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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const storage_service_1 = require("./storage.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let StorageController = class StorageController {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    async uploadImage(file, type) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (!type) {
            throw new common_1.BadRequestException('Upload type is required (avatar, course, artwork, product, post)');
        }
        return this.storageService.uploadImage(file, type);
    }
    async uploadVideo(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        return this.storageService.uploadVideo(file);
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('video'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a video (teacher only)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadVideo", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('Upload'),
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map