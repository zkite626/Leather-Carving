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
var CourseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const utils_1 = require("../../shared/utils");
let CourseService = CourseService_1 = class CourseService {
    prisma;
    logger = new common_1.Logger(CourseService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const teacherProfile = await this.prisma.teacherProfile.findUnique({
            where: { userId },
        });
        if (!teacherProfile) {
            throw new common_1.BadRequestException('You need a teacher profile to create courses');
        }
        const baseSlug = (0, utils_1.slugify)(dto.title);
        const slug = await this.generateUniqueSlug(baseSlug);
        const price = dto.isFree ? 0 : (dto.price ?? 0);
        const isFree = dto.isFree ?? price === 0;
        const course = await this.prisma.course.create({
            data: {
                teacherId: teacherProfile.id,
                title: dto.title,
                slug,
                subtitle: dto.subtitle,
                description: dto.description,
                coverImage: dto.coverImage,
                level: dto.level,
                category: dto.category,
                tags: dto.tags ?? [],
                price,
                originalPrice: dto.originalPrice,
                isFree,
                status: client_1.CourseStatus.DRAFT,
            },
            include: this.courseWithTeacher(),
        });
        this.logger.log(`Course created: ${course.id} by teacher ${userId}`);
        return this.formatCourse(course);
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = Math.min(query.pageSize ?? 20, 100);
        const skip = (page - 1) * pageSize;
        const where = {
            status: client_1.CourseStatus.PUBLISHED,
            deletedAt: null,
        };
        if (query.level)
            where.level = query.level;
        if (query.category)
            where.category = query.category;
        if (query.isFree !== undefined)
            where.isFree = query.isFree;
        if (query.keyword) {
            where.OR = [
                { title: { contains: query.keyword, mode: 'insensitive' } },
                { subtitle: { contains: query.keyword, mode: 'insensitive' } },
                { tags: { has: query.keyword } },
            ];
        }
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: pageSize,
                orderBy,
                include: this.courseWithTeacher(),
            }),
            this.prisma.course.count({ where }),
        ]);
        return {
            data: courses.map((c) => this.formatCourse(c)),
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async findBySlug(slug) {
        const course = await this.prisma.course.findUnique({
            where: { slug, deletedAt: null },
            include: {
                ...this.courseWithTeacher(),
                chapters: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { sortOrder: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                duration: true,
                                isFreePreview: true,
                                sortOrder: true,
                            },
                        },
                    },
                },
                reviews: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, nickname: true, avatar: true, role: true },
                        },
                    },
                },
            },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        const reviewStats = await this.prisma.review.aggregate({
            where: { courseId: course.id },
            _avg: { rating: true },
            _count: true,
        });
        const distribution = await this.prisma.review.groupBy({
            by: ['rating'],
            where: { courseId: course.id },
            _count: true,
        });
        const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const d of distribution) {
            distMap[d.rating] = d._count;
        }
        const teacherCourseCount = await this.prisma.course.count({
            where: {
                teacherId: course.teacherId,
                status: client_1.CourseStatus.PUBLISHED,
                deletedAt: null,
            },
        });
        return {
            ...this.formatCourse(course),
            chapters: course.chapters,
            reviews: course.reviews,
            teacher: {
                ...this.formatCourse(course).teacher,
                profile: {
                    title: course.teacher.title,
                    specialties: course.teacher.specialties,
                    experience: course.teacher.experience,
                    introduction: course.teacher.introduction,
                    isVerified: course.teacher.isVerified,
                },
                courseCount: teacherCourseCount,
            },
            reviewSummary: {
                average: Math.round(Number(reviewStats._avg.rating ?? 0) * 100) / 100,
                count: reviewStats._count,
                distribution: distMap,
            },
        };
    }
    async findById(id) {
        const course = await this.prisma.course.findUnique({
            where: { id, deletedAt: null },
            include: {
                ...this.courseWithTeacher(),
                chapters: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        lessons: { orderBy: { sortOrder: 'asc' } },
                    },
                },
            },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return { ...this.formatCourse(course), chapters: course.chapters };
    }
    async update(courseId, userId, dto) {
        await this.ensureOwnership(courseId, userId);
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.subtitle !== undefined)
            data.subtitle = dto.subtitle;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.coverImage !== undefined)
            data.coverImage = dto.coverImage;
        if (dto.level !== undefined)
            data.level = dto.level;
        if (dto.category !== undefined)
            data.category = dto.category;
        if (dto.tags !== undefined)
            data.tags = dto.tags;
        if (dto.price !== undefined)
            data.price = dto.price;
        if (dto.originalPrice !== undefined)
            data.originalPrice = dto.originalPrice;
        if (dto.isFree !== undefined) {
            data.isFree = dto.isFree;
            if (dto.isFree)
                data.price = 0;
        }
        const updated = await this.prisma.course.update({
            where: { id: courseId },
            data,
            include: this.courseWithTeacher(),
        });
        return this.formatCourse(updated);
    }
    async remove(courseId, userId) {
        await this.ensureOwnership(courseId, userId);
        await this.prisma.course.update({
            where: { id: courseId },
            data: { deletedAt: new Date() },
        });
        this.logger.log(`Course soft-deleted: ${courseId}`);
    }
    async publish(courseId, userId) {
        await this.ensureOwnership(courseId, userId);
        const chapterCount = await this.prisma.chapter.count({
            where: { courseId },
        });
        if (chapterCount === 0) {
            throw new common_1.BadRequestException('Cannot publish a course without chapters');
        }
        return this.prisma.course.update({
            where: { id: courseId },
            data: { status: client_1.CourseStatus.PUBLISHED, publishedAt: new Date() },
        });
    }
    async findTeacherCourses(userId, query) {
        const teacherProfile = await this.getTeacherProfile(userId);
        const page = query.page ?? 1;
        const pageSize = Math.min(query.pageSize ?? 20, 100);
        const skip = (page - 1) * pageSize;
        const where = {
            teacherId: teacherProfile.id,
            deletedAt: null,
        };
        if (query.keyword) {
            where.OR = [
                { title: { contains: query.keyword, mode: 'insensitive' } },
                { subtitle: { contains: query.keyword, mode: 'insensitive' } },
            ];
        }
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: { select: { chapters: true, enrollments: true } },
                },
            }),
            this.prisma.course.count({ where }),
        ]);
        return {
            data: courses,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getTeacherDashboard(userId) {
        const teacherProfile = await this.getTeacherProfile(userId);
        const courses = await this.prisma.course.findMany({
            where: { teacherId: teacherProfile.id, deletedAt: null },
            select: { id: true, status: true, enrollCount: true, rating: true },
        });
        const totalStudents = courses.reduce((sum, c) => sum + c.enrollCount, 0);
        const publishedCourses = courses.filter((c) => c.status === client_1.CourseStatus.PUBLISHED).length;
        const avgRating = courses.length > 0
            ? courses.reduce((sum, c) => sum + Number(c.rating), 0) / courses.length
            : 0;
        const recentEnrollments = await this.prisma.enrollment.findMany({
            where: { course: { teacherId: teacherProfile.id, deletedAt: null } },
            take: 10,
            orderBy: { enrolledAt: 'desc' },
            include: {
                user: { select: { id: true, nickname: true, avatar: true } },
                course: { select: { id: true, title: true, slug: true } },
            },
        });
        return {
            totalCourses: courses.length,
            publishedCourses,
            totalStudents,
            avgRating: Math.round(avgRating * 100) / 100,
            recentEnrollments,
        };
    }
    async createChapter(courseId, userId, dto) {
        await this.ensureOwnership(courseId, userId);
        const maxOrder = await this.prisma.chapter.aggregate({
            where: { courseId },
            _max: { sortOrder: true },
        });
        return this.prisma.chapter.create({
            data: {
                courseId,
                title: dto.title,
                sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
            },
        });
    }
    async updateChapter(chapterId, userId, dto) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { course: true },
        });
        if (!chapter)
            throw new common_1.NotFoundException('Chapter not found');
        await this.ensureOwnership(chapter.courseId, userId);
        return this.prisma.chapter.update({
            where: { id: chapterId },
            data: dto,
        });
    }
    async deleteChapter(chapterId, userId) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { course: true },
        });
        if (!chapter)
            throw new common_1.NotFoundException('Chapter not found');
        await this.ensureOwnership(chapter.courseId, userId);
        await this.prisma.chapter.delete({ where: { id: chapterId } });
    }
    async reorderChapters(courseId, userId, chapterIds) {
        await this.ensureOwnership(courseId, userId);
        const updates = chapterIds.map((id, index) => this.prisma.chapter.update({
            where: { id },
            data: { sortOrder: index },
        }));
        await this.prisma.$transaction(updates);
    }
    async createLesson(chapterId, userId, dto) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { course: true },
        });
        if (!chapter)
            throw new common_1.NotFoundException('Chapter not found');
        await this.ensureOwnership(chapter.courseId, userId);
        const maxOrder = await this.prisma.lesson.aggregate({
            where: { chapterId },
            _max: { sortOrder: true },
        });
        const lesson = await this.prisma.lesson.create({
            data: {
                chapterId,
                title: dto.title,
                type: dto.type,
                content: dto.content,
                videoUrl: dto.videoUrl,
                duration: dto.duration ?? 0,
                isFreePreview: dto.isFreePreview ?? false,
                sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
            },
        });
        await this.updateCourseTotals(chapter.courseId);
        return lesson;
    }
    async updateLesson(lessonId, userId, dto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { chapter: { include: { course: true } } },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        await this.ensureOwnership(lesson.chapter.courseId, userId);
        const updated = await this.prisma.lesson.update({
            where: { id: lessonId },
            data: dto,
        });
        if (dto.duration !== undefined) {
            await this.updateCourseTotals(lesson.chapter.courseId);
        }
        return updated;
    }
    async deleteLesson(lessonId, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { chapter: { include: { course: true } } },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        await this.ensureOwnership(lesson.chapter.courseId, userId);
        await this.prisma.lesson.delete({ where: { id: lessonId } });
        await this.updateCourseTotals(lesson.chapter.courseId);
    }
    async reorderLessons(chapterId, userId, lessonIds) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { course: true },
        });
        if (!chapter)
            throw new common_1.NotFoundException('Chapter not found');
        await this.ensureOwnership(chapter.courseId, userId);
        const updates = lessonIds.map((id, index) => this.prisma.lesson.update({
            where: { id },
            data: { sortOrder: index },
        }));
        await this.prisma.$transaction(updates);
    }
    async enroll(userId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId, status: client_1.CourseStatus.PUBLISHED, deletedAt: null },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found or not published');
        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing)
            throw new common_1.ConflictException('Already enrolled in this course');
        if (course.isFree) {
            const enrollment = await this.prisma.enrollment.create({
                data: { userId, courseId },
            });
            await this.prisma.course.update({
                where: { id: courseId },
                data: { enrollCount: { increment: 1 } },
            });
            this.logger.log(`User ${userId} enrolled in course ${courseId}`);
            return enrollment;
        }
        throw new common_1.BadRequestException('This is a paid course. Payment is required to enroll.');
    }
    async getEnrollment(userId, courseId) {
        return this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
    }
    async getMyCourses(userId, page = 1, pageSize = 20) {
        const skip = (page - 1) * pageSize;
        const [enrollments, total] = await Promise.all([
            this.prisma.enrollment.findMany({
                where: { userId },
                skip,
                take: pageSize,
                orderBy: { enrolledAt: 'desc' },
                include: {
                    course: {
                        include: {
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            nickname: true,
                                            avatar: true,
                                            role: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    lessonProgresses: true,
                },
            }),
            this.prisma.enrollment.count({ where: { userId } }),
        ]);
        return {
            data: enrollments.map((e) => ({
                ...e,
                progress: Number(e.progress),
                course: this.formatCourse(e.course),
            })),
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async updateProgress(userId, lessonId, dto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { chapter: { include: { course: true } } },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId: lesson.chapter.courseId },
            },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('You must be enrolled to track progress');
        }
        const progress = await this.prisma.lessonProgress.upsert({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: enrollment.id,
                    lessonId,
                },
            },
            create: {
                enrollmentId: enrollment.id,
                lessonId,
                watchedDuration: dto.watchedDuration,
                lastPosition: dto.lastPosition,
                isCompleted: dto.isCompleted ?? false,
                completedAt: dto.isCompleted ? new Date() : null,
            },
            update: {
                watchedDuration: dto.watchedDuration,
                lastPosition: dto.lastPosition,
                ...(dto.isCompleted
                    ? { isCompleted: true, completedAt: new Date() }
                    : {}),
            },
        });
        await this.updateEnrollmentProgress(enrollment.id, lesson.chapter.courseId);
        return progress;
    }
    async getLessonProgress(userId, lessonId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { chapter: { select: { courseId: true } } },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId: lesson.chapter.courseId },
            },
        });
        if (!enrollment)
            return null;
        return this.prisma.lessonProgress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: enrollment.id,
                    lessonId,
                },
            },
        });
    }
    async getCourseProgress(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            include: { lessonProgresses: true },
        });
        if (!enrollment)
            return null;
        return {
            ...enrollment,
            progress: Number(enrollment.progress),
        };
    }
    courseWithTeacher() {
        return {
            teacher: {
                include: {
                    user: {
                        select: { id: true, nickname: true, avatar: true, role: true },
                    },
                },
            },
        };
    }
    formatCourse(course) {
        const { teacher, ...rest } = course;
        const teacherObj = teacher;
        return {
            ...rest,
            price: Number(rest.price),
            originalPrice: rest.originalPrice ? Number(rest.originalPrice) : null,
            rating: Number(rest.rating),
            teacher: teacherObj?.user ?? teacherObj,
        };
    }
    async getTeacherProfile(userId) {
        const profile = await this.prisma.teacherProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.BadRequestException('Teacher profile not found');
        }
        return profile;
    }
    async ensureOwnership(courseId, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId, deletedAt: null },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        const teacherProfile = await this.prisma.teacherProfile.findUnique({
            where: { userId },
        });
        if (!teacherProfile || course.teacherId !== teacherProfile.id) {
            throw new common_1.ForbiddenException('You can only modify your own courses');
        }
        return course;
    }
    async generateUniqueSlug(baseSlug) {
        let slug = baseSlug;
        let counter = 0;
        while (true) {
            const existing = await this.prisma.course.findUnique({ where: { slug } });
            if (!existing)
                return slug;
            counter++;
            slug = `${baseSlug}-${counter}`;
        }
    }
    async updateCourseTotals(courseId) {
        const result = await this.prisma.lesson.aggregate({
            where: { chapter: { courseId } },
            _sum: { duration: true },
            _count: true,
        });
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                totalDuration: result._sum.duration ?? 0,
                totalLessons: result._count,
            },
        });
    }
    async updateEnrollmentProgress(enrollmentId, courseId) {
        const totalLessons = await this.prisma.lesson.count({
            where: { chapter: { courseId } },
        });
        if (totalLessons === 0)
            return;
        const completedLessons = await this.prisma.lessonProgress.count({
            where: { enrollmentId, isCompleted: true },
        });
        const progress = Math.round((completedLessons / totalLessons) * 10000) / 100;
        await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                progress,
                ...(progress >= 100
                    ? { status: 'COMPLETED', completedAt: new Date() }
                    : {}),
            },
        });
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = CourseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseService);
//# sourceMappingURL=course.service.js.map