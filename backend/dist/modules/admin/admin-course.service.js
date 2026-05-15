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
var AdminCourseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCourseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminCourseService = AdminCourseService_1 = class AdminCourseService {
    prisma;
    logger = new common_1.Logger(AdminCourseService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w一-鿿]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 200) || `course-${Date.now()}`;
    }
    async createCourse(adminId, dto) {
        let teacherProfile = await this.prisma.teacherProfile.findUnique({
            where: { userId: adminId },
        });
        if (!teacherProfile) {
            teacherProfile = await this.prisma.teacherProfile.create({
                data: {
                    userId: adminId,
                    title: '平台管理员',
                    specialties: ['皮雕艺术'],
                    isVerified: true,
                },
            });
        }
        const slug = this.generateSlug(dto.title);
        const existing = await this.prisma.course.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException('课程 slug 已存在');
        const course = await this.prisma.course.create({
            data: {
                teacherId: teacherProfile.id,
                title: dto.title,
                slug,
                subtitle: dto.subtitle,
                description: dto.description,
                coverImage: dto.coverImage,
                level: dto.level ?? 'BEGINNER',
                category: dto.category,
                tags: dto.tags ?? [],
                price: dto.price != null ? new client_1.Prisma.Decimal(dto.price) : new client_1.Prisma.Decimal(0),
                originalPrice: dto.originalPrice != null ? new client_1.Prisma.Decimal(dto.originalPrice) : null,
                isFree: dto.isFree ?? false,
                status: 'DRAFT',
            },
            include: {
                teacher: { include: { user: { select: { nickname: true } } } },
            },
        });
        this.logger.log(`Admin created course: ${course.title} (${course.id})`);
        return {
            ...course,
            teacherName: course.teacher.user.nickname,
            price: String(course.price),
            originalPrice: course.originalPrice ? String(course.originalPrice) : null,
        };
    }
    async getCourses(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {
            deletedAt: null,
            ...(query.keyword && {
                OR: [
                    { title: { contains: query.keyword, mode: 'insensitive' } },
                    { subtitle: { contains: query.keyword, mode: 'insensitive' } },
                ],
            }),
            ...(query.status && { status: query.status }),
            ...(query.level && { level: query.level }),
        };
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    teacher: {
                        include: {
                            user: { select: { nickname: true, avatar: true } },
                        },
                    },
                    _count: { select: { enrollments: true, chapters: true } },
                },
            }),
            this.prisma.course.count({ where }),
        ]);
        return {
            items: courses.map((c) => ({
                ...c,
                teacherName: c.teacher.user.nickname,
                price: String(c.price),
                originalPrice: c.originalPrice ? String(c.originalPrice) : null,
                rating: String(c.rating),
            })),
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }
    async getCourseById(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                teacher: {
                    include: { user: { select: { nickname: true, avatar: true } } },
                },
                chapters: { orderBy: { sortOrder: 'asc' } },
                _count: { select: { enrollments: true } },
            },
        });
        if (!course || course.deletedAt)
            throw new common_1.NotFoundException('课程不存在');
        return course;
    }
    async updateCourseStatus(id, status) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course || course.deletedAt)
            throw new common_1.NotFoundException('课程不存在');
        const updated = await this.prisma.course.update({
            where: { id },
            data: {
                status: status,
                ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
            },
        });
        this.logger.log(`Course ${id} status changed: ${course.status} -> ${status}`);
        return updated;
    }
    async deleteCourse(id) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course || course.deletedAt)
            throw new common_1.NotFoundException('课程不存在');
        await this.prisma.course.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        this.logger.log(`Admin deleted course: ${id}`);
        return { message: '课程已删除' };
    }
};
exports.AdminCourseService = AdminCourseService;
exports.AdminCourseService = AdminCourseService = AdminCourseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminCourseService);
//# sourceMappingURL=admin-course.service.js.map