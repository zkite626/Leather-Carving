import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Course Reviews ────────────────────────────────────────────────

  async createCourseReview(
    userId: string,
    courseId: string,
    dto: CreateReviewDto,
  ) {
    // Verify enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You must be enrolled in this course to leave a review',
      );
    }

    // Check existing review
    const existing = await this.prisma.review.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this course');
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

    // Update course rating
    await this.updateCourseRating(courseId);

    this.logger.log(`Review created for course ${courseId} by user ${userId}`);
    return review;
  }

  async getCourseReviews(courseId: string, page = 1, pageSize = 10) {
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

  async getCourseReviewSummary(courseId: string) {
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

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of distribution) {
      distMap[d.rating] = d._count;
    }

    return {
      average: Number(stats._avg.rating ?? 0),
      count: stats._count,
      distribution: distMap,
    };
  }

  // ─── Product Reviews ───────────────────────────────────────────────

  async createProductReview(
    userId: string,
    productId: string,
    dto: CreateReviewDto,
  ) {
    // Verify user has a completed order containing this product
    const completedOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.COMPLETED,
        items: {
          some: { productId },
        },
      },
    });

    if (!completedOrder) {
      throw new ForbiddenException(
        'You can only review products from completed orders',
      );
    }

    // One review per user per product
    const existing = await this.prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this product');
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

    // Recalculate product rating
    await this.updateProductRating(productId);

    this.logger.log(
      `Review created for product ${productId} by user ${userId}`,
    );
    return review;
  }

  async getProductReviews(productId: string, page = 1, pageSize = 10) {
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

  async getProductReviewSummary(productId: string) {
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

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of distribution) {
      distMap[d.rating] = d._count;
    }

    return {
      average: Number(stats._avg.rating ?? 0),
      count: stats._count,
      distribution: distMap,
    };
  }

  // ─── Delete ────────────────────────────────────────────────────────

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });

    if (review.courseId) {
      await this.updateCourseRating(review.courseId);
    }

    if (review.productId) {
      await this.updateProductRating(review.productId);
    }
  }

  // ─── Private Rating Helpers ────────────────────────────────────────

  private async updateCourseRating(courseId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
    });

    await this.prisma.course.update({
      where: { id: courseId },
      data: { rating: Math.round(Number(stats._avg.rating ?? 0) * 100) / 100 },
    });
  }

  private async updateProductRating(productId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: { rating: Math.round(Number(stats._avg.rating ?? 0) * 100) / 100 },
    });
  }
}
