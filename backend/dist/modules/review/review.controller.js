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
exports.ReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const review_service_1 = require("./review.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReviewController = class ReviewController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    async createCourseReview(courseId, userId, dto) {
        return this.reviewService.createCourseReview(userId, courseId, dto);
    }
    async getCourseReviews(courseId, page, pageSize) {
        return this.reviewService.getCourseReviews(courseId, page, pageSize);
    }
    async getCourseReviewSummary(courseId) {
        return this.reviewService.getCourseReviewSummary(courseId);
    }
    async createProductReview(productId, userId, dto) {
        return this.reviewService.createProductReview(userId, productId, dto);
    }
    async getProductReviews(productId, page, pageSize) {
        return this.reviewService.getProductReviews(productId, page, pageSize);
    }
    async getProductReviewSummary(productId) {
        return this.reviewService.getProductReviewSummary(productId);
    }
    async deleteReview(id, userId) {
        await this.reviewService.deleteReview(id, userId);
        return { message: 'Review deleted' };
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Post)('courses/:courseId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a course review' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "createCourseReview", null);
__decorate([
    (0, common_1.Get)('courses/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course reviews' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getCourseReviews", null);
__decorate([
    (0, common_1.Get)('courses/:courseId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course review summary' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getCourseReviewSummary", null);
__decorate([
    (0, common_1.Post)('products/:productId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a product review' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "createProductReview", null);
__decorate([
    (0, common_1.Get)('products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product reviews' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getProductReviews", null);
__decorate([
    (0, common_1.Get)('products/:productId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product review summary' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getProductReviewSummary", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a review' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "deleteReview", null);
exports.ReviewController = ReviewController = __decorate([
    (0, swagger_1.ApiTags)('Reviews'),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewController);
//# sourceMappingURL=review.controller.js.map