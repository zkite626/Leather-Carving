import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    createCourseReview(courseId: string, userId: string, dto: CreateReviewDto): Promise<{
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
    createProductReview(productId: string, userId: string, dto: CreateReviewDto): Promise<{
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
    deleteReview(id: string, userId: string): Promise<{
        message: string;
    }>;
}
