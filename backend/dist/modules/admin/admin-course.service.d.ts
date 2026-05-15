import { PrismaService } from '../prisma/prisma.service';
import { CourseQueryDto } from './dto';
import { Prisma } from '@prisma/client';
interface CreateCourseInput {
    title: string;
    subtitle?: string;
    description?: string;
    coverImage?: string;
    level?: string;
    category?: string;
    tags?: string[];
    price?: number;
    originalPrice?: number;
    isFree?: boolean;
}
export declare class AdminCourseService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private generateSlug;
    createCourse(adminId: string, dto: CreateCourseInput): Promise<{
        teacherName: string;
        price: string;
        originalPrice: string | null;
        teacher: {
            user: {
                nickname: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            specialties: string[];
            experience: number;
            certifications: Prisma.JsonValue | null;
            introduction: string | null;
            isVerified: boolean;
        };
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        description: string | null;
        coverImage: string | null;
        rating: Prisma.Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: Prisma.JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    }>;
    getCourses(query: CourseQueryDto): Promise<{
        items: {
            teacherName: string;
            price: string;
            originalPrice: string | null;
            rating: string;
            _count: {
                enrollments: number;
                chapters: number;
            };
            teacher: {
                user: {
                    nickname: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                title: string;
                specialties: string[];
                experience: number;
                certifications: Prisma.JsonValue | null;
                introduction: string | null;
                isVerified: boolean;
            };
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            slug: string;
            description: string | null;
            coverImage: string | null;
            tags: string[];
            category: string | null;
            subtitle: string | null;
            level: import("@prisma/client").$Enums.CourseLevel;
            isFree: boolean;
            enrollCount: number;
            totalDuration: number;
            totalLessons: number;
            metadata: Prisma.JsonValue | null;
            publishedAt: Date | null;
            teacherId: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCourseById(id: string): Promise<{
        _count: {
            enrollments: number;
        };
        teacher: {
            user: {
                nickname: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            specialties: string[];
            experience: number;
            certifications: Prisma.JsonValue | null;
            introduction: string | null;
            isVerified: boolean;
        };
        chapters: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sortOrder: number;
            courseId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        rating: Prisma.Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: Prisma.JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    }>;
    updateCourseStatus(id: string, status: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        rating: Prisma.Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: Prisma.JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    }>;
    deleteCourse(id: string): Promise<{
        message: string;
    }>;
}
export {};
