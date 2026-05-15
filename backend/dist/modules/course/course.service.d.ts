import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { CreateChapterDto, UpdateChapterDto } from './dto/create-chapter.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
export declare class CourseService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateCourseDto): Promise<{
        price: number;
        originalPrice: number | null;
        rating: number;
        teacher: {} | undefined;
    }>;
    findAll(query: QueryCourseDto): Promise<{
        data: {
            price: number;
            originalPrice: number | null;
            rating: number;
            teacher: {} | undefined;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<{
        chapters: ({
            lessons: {
                id: string;
                title: string;
                sortOrder: number;
                type: import("@prisma/client").$Enums.LessonType;
                duration: number;
                isFreePreview: boolean;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sortOrder: number;
            courseId: string;
        })[];
        reviews: ({
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
        teacher: {
            profile: {
                title: string;
                specialties: string[];
                experience: number;
                introduction: string | null;
                isVerified: boolean;
            };
            courseCount: number;
        };
        reviewSummary: {
            average: number;
            count: number;
            distribution: Record<number, number>;
        };
        price: number;
        originalPrice: number | null;
        rating: number;
    }>;
    findById(id: string): Promise<{
        chapters: ({
            lessons: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                sortOrder: number;
                type: import("@prisma/client").$Enums.LessonType;
                content: string | null;
                videoUrl: string | null;
                duration: number;
                isFreePreview: boolean;
                chapterId: string;
                attachments: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sortOrder: number;
            courseId: string;
        })[];
        price: number;
        originalPrice: number | null;
        rating: number;
        teacher: {} | undefined;
    }>;
    update(courseId: string, userId: string, dto: UpdateCourseDto): Promise<{
        price: number;
        originalPrice: number | null;
        rating: number;
        teacher: {} | undefined;
    }>;
    remove(courseId: string, userId: string): Promise<void>;
    publish(courseId: string, userId: string): Promise<{
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
    findTeacherCourses(userId: string, query: QueryCourseDto): Promise<{
        data: ({
            _count: {
                enrollments: number;
                chapters: number;
            };
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
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTeacherDashboard(userId: string): Promise<{
        totalCourses: number;
        publishedCourses: number;
        totalStudents: number;
        avgRating: number;
        recentEnrollments: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
            course: {
                id: string;
                title: string;
                slug: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            courseId: string;
            progress: Prisma.Decimal;
            enrolledAt: Date;
            completedAt: Date | null;
            expiredAt: Date | null;
        })[];
    }>;
    createChapter(courseId: string, userId: string, dto: CreateChapterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        sortOrder: number;
        courseId: string;
    }>;
    updateChapter(chapterId: string, userId: string, dto: UpdateChapterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        sortOrder: number;
        courseId: string;
    }>;
    deleteChapter(chapterId: string, userId: string): Promise<void>;
    reorderChapters(courseId: string, userId: string, chapterIds: string[]): Promise<void>;
    createLesson(chapterId: string, userId: string, dto: CreateLessonDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        sortOrder: number;
        type: import("@prisma/client").$Enums.LessonType;
        content: string | null;
        videoUrl: string | null;
        duration: number;
        isFreePreview: boolean;
        chapterId: string;
        attachments: Prisma.JsonValue | null;
    }>;
    updateLesson(lessonId: string, userId: string, dto: UpdateLessonDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        sortOrder: number;
        type: import("@prisma/client").$Enums.LessonType;
        content: string | null;
        videoUrl: string | null;
        duration: number;
        isFreePreview: boolean;
        chapterId: string;
        attachments: Prisma.JsonValue | null;
    }>;
    deleteLesson(lessonId: string, userId: string): Promise<void>;
    reorderLessons(chapterId: string, userId: string, lessonIds: string[]): Promise<void>;
    enroll(userId: string, courseId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        courseId: string;
        progress: Prisma.Decimal;
        enrolledAt: Date;
        completedAt: Date | null;
        expiredAt: Date | null;
    }>;
    getEnrollment(userId: string, courseId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        courseId: string;
        progress: Prisma.Decimal;
        enrolledAt: Date;
        completedAt: Date | null;
        expiredAt: Date | null;
    } | null>;
    getMyCourses(userId: string, page?: number, pageSize?: number): Promise<{
        data: {
            progress: number;
            course: {
                price: number;
                originalPrice: number | null;
                rating: number;
                teacher: {} | undefined;
            };
            lessonProgresses: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                watchedDuration: number;
                lastPosition: number;
                isCompleted: boolean;
                completedAt: Date | null;
                enrollmentId: string;
                lessonId: string;
            }[];
            id: string;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            courseId: string;
            enrolledAt: Date;
            completedAt: Date | null;
            expiredAt: Date | null;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateProgress(userId: string, lessonId: string, dto: UpdateProgressDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        watchedDuration: number;
        lastPosition: number;
        isCompleted: boolean;
        completedAt: Date | null;
        enrollmentId: string;
        lessonId: string;
    }>;
    getLessonProgress(userId: string, lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        watchedDuration: number;
        lastPosition: number;
        isCompleted: boolean;
        completedAt: Date | null;
        enrollmentId: string;
        lessonId: string;
    } | null>;
    getCourseProgress(userId: string, courseId: string): Promise<{
        progress: number;
        lessonProgresses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            watchedDuration: number;
            lastPosition: number;
            isCompleted: boolean;
            completedAt: Date | null;
            enrollmentId: string;
            lessonId: string;
        }[];
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        courseId: string;
        enrolledAt: Date;
        completedAt: Date | null;
        expiredAt: Date | null;
    } | null>;
    private courseWithTeacher;
    private formatCourse;
    private getTeacherProfile;
    private ensureOwnership;
    private generateUniqueSlug;
    private updateCourseTotals;
    private updateEnrollmentProgress;
}
