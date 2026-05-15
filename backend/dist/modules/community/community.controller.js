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
exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const community_service_1 = require("./community.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CommunityController = class CommunityController {
    communityService;
    constructor(communityService) {
        this.communityService = communityService;
    }
    async findAll(page, pageSize, type, keyword, sortBy, sortOrder) {
        return this.communityService.findAll({
            page,
            pageSize,
            type,
            keyword,
            sortBy,
            sortOrder,
        });
    }
    async getHotTopics() {
        return this.communityService.getHotTopics();
    }
    async findOne(id) {
        return this.communityService.findOne(id);
    }
    async create(userId, dto) {
        return this.communityService.create(userId, dto);
    }
    async update(id, userId, dto) {
        return this.communityService.update(id, userId, dto);
    }
    async remove(id, userId) {
        await this.communityService.remove(id, userId);
        return { message: 'Post deleted' };
    }
    async getCheckinStatus(id, userId) {
        return this.communityService.getChallengeCheckins(userId, id);
    }
    async checkin(id, userId) {
        return this.communityService.checkin(userId, id);
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, common_1.Get)('posts'),
    (0, swagger_1.ApiOperation)({ summary: 'List posts with filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: create_post_dto_1.PostType }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('keyword')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('posts/hot'),
    (0, swagger_1.ApiOperation)({ summary: 'Get hot topics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "getHotTopics", null);
__decorate([
    (0, common_1.Get)('posts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get post detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('posts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a post' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('posts/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('posts/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('posts/:id/checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get challenge check-in status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "getCheckinStatus", null);
__decorate([
    (0, common_1.Post)('posts/:id/checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check in to a challenge' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "checkin", null);
exports.CommunityController = CommunityController = __decorate([
    (0, swagger_1.ApiTags)('Community'),
    (0, common_1.Controller)('community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
//# sourceMappingURL=community.controller.js.map