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
var ReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewService = ReviewService_1 = class ReviewService {
    prisma;
    logger = new common_1.Logger(ReviewService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCourseReview(userId, courseId, dto) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('You must be enrolled in this course to leave a review');
        }
        const existing = await this.prisma.review.findFirst({
            where: { userId, courseId },
        });
        if (existing) {
            throw new common_1.ConflictException('You have already reviewed this course');
        }
        const review = await this.prisma.review.create({
            data: {
                userId,
                courseId,
                rating: dto.rating,
                content: dto.content,
                images: dto.images ?? [],
            },
            include: {
                user: {
                    select: { id: true, nickname: true, avatar: true, role: true },
                },
            },
        });
        await this.updateCourseRating(courseId);
        this.logger.log(`Review created for course ${courseId} by user ${userId}`);
        return review;
    }
    async getCourseReviews(courseId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { courseId },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, nickname: true, avatar: true, role: true },
                    },
                },
            }),
            this.prisma.review.count({ where: { courseId } }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getCourseReviewSummary(courseId) {
        const stats = await this.prisma.review.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: true,
        });
        const distribution = await this.prisma.review.groupBy({
            by: ['rating'],
            where: { courseId },
            _count: true,
        });
        const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const d of distribution) {
            distMap[d.rating] = d._count;
        }
        return {
            average: Number(stats._avg.rating ?? 0),
            count: stats._count,
            distribution: distMap,
        };
    }
    async createProductReview(userId, productId, dto) {
        const completedOrder = await this.prisma.order.findFirst({
            where: {
                userId,
                status: client_1.OrderStatus.COMPLETED,
                items: {
                    some: { productId },
                },
            },
        });
        if (!completedOrder) {
            throw new common_1.ForbiddenException('You can only review products from completed orders');
        }
        const existing = await this.prisma.review.findFirst({
            where: { userId, productId },
        });
        if (existing) {
            throw new common_1.ConflictException('You have already reviewed this product');
        }
        const review = await this.prisma.review.create({
            data: {
                userId,
                productId,
                rating: dto.rating,
                content: dto.content,
                images: dto.images ?? [],
            },
            include: {
                user: {
                    select: { id: true, nickname: true, avatar: true, role: true },
                },
            },
        });
        await this.updateProductRating(productId);
        this.logger.log(`Review created for product ${productId} by user ${userId}`);
        return review;
    }
    async getProductReviews(productId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { productId },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, nickname: true, avatar: true, role: true },
                    },
                },
            }),
            this.prisma.review.count({ where: { productId } }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getProductReviewSummary(productId) {
        const stats = await this.prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: true,
        });
        const distribution = await this.prisma.review.groupBy({
            by: ['rating'],
            where: { productId },
            _count: true,
        });
        const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const d of distribution) {
            distMap[d.rating] = d._count;
        }
        return {
            average: Number(stats._avg.rating ?? 0),
            count: stats._count,
            distribution: distMap,
        };
    }
    async deleteReview(reviewId, userId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        await this.prisma.review.delete({ where: { id: reviewId } });
        if (review.courseId) {
            await this.updateCourseRating(review.courseId);
        }
        if (review.productId) {
            await this.updateProductRating(review.productId);
        }
    }
    async updateCourseRating(courseId) {
        const stats = await this.prisma.review.aggregate({
            where: { courseId },
            _avg: { rating: true },
        });
        await this.prisma.course.update({
            where: { id: courseId },
            data: { rating: Math.round(Number(stats._avg.rating ?? 0) * 100) / 100 },
        });
    }
    async updateProductRating(productId) {
        const stats = await this.prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
        });
        await this.prisma.product.update({
            where: { id: productId },
            data: { rating: Math.round(Number(stats._avg.rating ?? 0) * 100) / 100 },
        });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = ReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map