import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createCourseReview(userId: string, courseId: string, dto: CreateReviewDto): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        images: string[];
        content: string | null;
        courseId: string | null;
        productId: string | null;
    }>;
    getCourseReviews(courseId: string, page?: number, pageSize?: number): Promise<{
        data: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            images: string[];
            content: string | null;
            courseId: string | null;
            productId: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCourseReviewSummary(courseId: string): Promise<{
        average: number;
        count: number;
        distribution: Record<number, number>;
    }>;
    createProductReview(userId: string, productId: string, dto: CreateReviewDto): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        images: string[];
        content: string | null;
        courseId: string | null;
        productId: string | null;
    }>;
    getProductReviews(productId: string, page?: number, pageSize?: number): Promise<{
        data: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            images: string[];
            content: string | null;
            courseId: string | null;
            productId: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProductReviewSummary(productId: string): Promise<{
        average: number;
        count: number;
        distribution: Record<number, number>;
    }>;
    deleteReview(reviewId: string, userId: string): Promise<void>;
    private updateCourseRating;
    private updateProductRating;
}
