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
exports.CommentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const comment_service_1 = require("./comment.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CommentController = class CommentController {
    commentService;
    constructor(commentService) {
        this.commentService = commentService;
    }
    async getArtworkComments(artworkId, page, pageSize) {
        return this.commentService.findByEntity('artwork', artworkId, page, pageSize);
    }
    async commentOnArtwork(artworkId, userId, dto) {
        return this.commentService.create(userId, 'artwork', artworkId, dto);
    }
    async getPostComments(postId, page, pageSize) {
        return this.commentService.findByEntity('post', postId, page, pageSize);
    }
    async commentOnPost(postId, userId, dto) {
        return this.commentService.create(userId, 'post', postId, dto);
    }
    async remove(id, userId) {
        await this.commentService.remove(id, userId);
        return { message: 'Comment deleted' };
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, common_1.Get)('artworks/:artworkId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get artwork comments' }),
    __param(0, (0, common_1.Param)('artworkId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getArtworkComments", null);
__decorate([
    (0, common_1.Post)('artworks/:artworkId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Comment on artwork' }),
    __param(0, (0, common_1.Param)('artworkId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "commentOnArtwork", null);
__decorate([
    (0, common_1.Get)('posts/:postId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get post comments' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getPostComments", null);
__decorate([
    (0, common_1.Post)('posts/:postId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Comment on post' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "commentOnPost", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete comment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "remove", null);
exports.CommentController = CommentController = __decorate([
    (0, swagger_1.ApiTags)('Comments'),
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comment_service_1.CommentService])
], CommentController);
//# sourceMappingURL=comment.controller.js.map