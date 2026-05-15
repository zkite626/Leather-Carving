import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { CreateChapterDto, UpdateChapterDto, ReorderChaptersDto } from './dto/create-chapter.dto';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto/create-lesson.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
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
    getMyTeacherCourses(userId: string, query: QueryCourseDto): Promise<{
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
            originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
            description: string | null;
            coverImage: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            rating: import("@prisma/client-runtime-utils").Decimal;
            tags: string[];
            category: string | null;
            subtitle: string | null;
            level: import("@prisma/client").$Enums.CourseLevel;
            isFree: boolean;
            enrollCount: number;
            totalDuration: number;
            totalLessons: number;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    getDashboard(userId: string): Promise<{
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
            progress: import("@prisma/client-runtime-utils").Decimal;
            enrolledAt: Date;
            completedAt: Date | null;
            expiredAt: Date | null;
        })[];
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
    create(userId: string, dto: CreateCourseDto): Promise<{
        price: number;
        originalPrice: number | null;
        rating: number;
        teacher: {} | undefined;
    }>;
    update(id: string, userId: string, dto: UpdateCourseDto): Promise<{
        price: number;
        originalPrice: number | null;
        rating: number;
        teacher: {} | undefined;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    publish(id: string, userId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        rating: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
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
    deleteChapter(chapterId: string, userId: string): Promise<{
        message: string;
    }>;
    reorderChapters(courseId: string, userId: string, dto: ReorderChaptersDto): Promise<{
        message: string;
    }>;
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    deleteLesson(lessonId: string, userId: string): Promise<{
        message: string;
    }>;
    reorderLessons(chapterId: string, userId: string, dto: ReorderLessonsDto): Promise<{
        message: string;
    }>;
    enroll(courseId: string, userId: string): Promise<{
        enrollmentId: string;
        courseId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
    }>;
    getEnrollment(courseId: string, userId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        courseId: string;
        progress: import("@prisma/client-runtime-utils").Decimal;
        enrolledAt: Date;
        completedAt: Date | null;
        expiredAt: Date | null;
    } | null>;
    updateProgress(lessonId: string, userId: string, dto: UpdateProgressDto): Promise<{
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
    getLessonProgress(lessonId: string, userId: string): Promise<{
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
    getCourseProgress(courseId: string, userId: string): Promise<{
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
}
