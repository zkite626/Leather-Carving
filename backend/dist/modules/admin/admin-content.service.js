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
var AdminContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminContentService = AdminContentService_1 = class AdminContentService {
    prisma;
    logger = new common_1.Logger(AdminContentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReviewQueue(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const status = query.status ?? 'REVIEWING';
        const type = query.type ?? 'all';
        const results = [];
        if (type === 'all' || type === 'course') {
            const courseStatus = status === 'REVIEWING'
                ? client_1.CourseStatus.REVIEWING
                : status === 'PUBLISHED'
                    ? client_1.CourseStatus.PUBLISHED
                    : client_1.CourseStatus.DRAFT;
            if (status !== 'REJECTED') {
                const courses = await this.prisma.course.findMany({
                    where: { status: courseStatus, deletedAt: null },
                    skip: type === 'course' ? skip : 0,
                    take: type === 'course' ? pageSize : 50,
                    include: {
                        teacher: {
                            include: {
                                user: { select: { id: true, nickname: true, avatar: true } },
                            },
                        },
                    },
                    orderBy: { updatedAt: 'desc' },
                });
                for (const c of courses) {
                    results.push({
                        id: c.id,
                        type: 'course',
                        title: c.title,
                        status: c.status,
                        author: c.teacher.user,
                        createdAt: c.createdAt,
                        updatedAt: c.updatedAt,
                        coverImage: c.coverImage,
                    });
                }
            }
        }
        if (type === 'all' || type === 'artwork') {
            const artworkStatus = status === 'REVIEWING'
                ? client_1.ArtworkStatus.REVIEWING
                : status === 'PUBLISHED'
                    ? client_1.ArtworkStatus.PUBLISHED
                    : client_1.ArtworkStatus.REJECTED;
            const artworks = await this.prisma.artwork.findMany({
                where: { status: artworkStatus, deletedAt: null },
                skip: type === 'artwork' ? skip : 0,
                take: type === 'artwork' ? pageSize : 50,
                include: {
                    user: { select: { id: true, nickname: true, avatar: true } },
                    images: { take: 1, orderBy: { sortOrder: 'asc' } },
                },
                orderBy: { updatedAt: 'desc' },
            });
            for (const a of artworks) {
                results.push({
                    id: a.id,
                    type: 'artwork',
                    title: a.title,
                    status: a.status,
                    author: a.user,
                    createdAt: a.createdAt,
                    updatedAt: a.updatedAt,
                    content: a.description ?? undefined,
                    coverImage: a.images[0]?.url ?? a.coverImage,
                });
            }
        }
        if (type === 'all' || type === 'post') {
            const postStatus = status === 'HIDDEN'
                ? client_1.PostStatus.HIDDEN
                : status === 'PUBLISHED'
                    ? client_1.PostStatus.PUBLISHED
                    : client_1.PostStatus.PUBLISHED;
            const posts = await this.prisma.post.findMany({
                where: { status: postStatus, deletedAt: null },
                skip: type === 'post' ? skip : 0,
                take: type === 'post' ? pageSize : 50,
                include: {
                    user: { select: { id: true, nickname: true, avatar: true } },
                },
                orderBy: { updatedAt: 'desc' },
            });
            for (const p of posts) {
                results.push({
                    id: p.id,
                    type: 'post',
                    title: p.title,
                    status: p.status,
                    author: p.user,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    content: p.content.substring(0, 200),
                });
            }
        }
        results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const total = results.length;
        const paginatedResults = type === 'all' ? results.slice(skip, skip + pageSize) : results;
        const totalAll = type === 'all' ? total : await this.getTotalCount(type, status);
        return {
            items: paginatedResults,
            pagination: {
                page,
                pageSize,
                total: type === 'all' ? total : totalAll,
                totalPages: Math.ceil((type === 'all' ? total : totalAll) / pageSize),
            },
        };
    }
    async getTotalCount(type, status) {
        if (type === 'course') {
            const s = status === 'REVIEWING'
                ? client_1.CourseStatus.REVIEWING
                : status === 'PUBLISHED'
                    ? client_1.CourseStatus.PUBLISHED
                    : client_1.CourseStatus.DRAFT;
            return this.prisma.course.count({
                where: { status: s, deletedAt: null },
            });
        }
        if (type === 'artwork') {
            const s = status === 'REVIEWING'
                ? client_1.ArtworkStatus.REVIEWING
                : status === 'PUBLISHED'
                    ? client_1.ArtworkStatus.PUBLISHED
                    : client_1.ArtworkStatus.REJECTED;
            return this.prisma.artwork.count({
                where: { status: s, deletedAt: null },
            });
        }
        if (type === 'post') {
            const s = status === 'HIDDEN' ? client_1.PostStatus.HIDDEN : client_1.PostStatus.PUBLISHED;
            return this.prisma.post.count({ where: { status: s, deletedAt: null } });
        }
        return 0;
    }
    async approveContent(id, type, dto) {
        if (type === 'course') {
            const course = await this.prisma.course.findUnique({ where: { id } });
            if (!course)
                throw new common_1.NotFoundException('Course not found');
            return this.prisma.course.update({
                where: { id },
                data: { status: client_1.CourseStatus.PUBLISHED, publishedAt: new Date() },
            });
        }
        if (type === 'artwork') {
            const artwork = await this.prisma.artwork.findUnique({ where: { id } });
            if (!artwork)
                throw new common_1.NotFoundException('Artwork not found');
            return this.prisma.artwork.update({
                where: { id },
                data: { status: client_1.ArtworkStatus.PUBLISHED },
            });
        }
        if (type === 'post') {
            const post = await this.prisma.post.findUnique({ where: { id } });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
            return this.prisma.post.update({
                where: { id },
                data: { status: client_1.PostStatus.PUBLISHED },
            });
        }
        throw new common_1.BadRequestException('Invalid content type');
    }
    async rejectContent(id, type, dto) {
        if (type === 'course') {
            const course = await this.prisma.course.findUnique({ where: { id } });
            if (!course)
                throw new common_1.NotFoundException('Course not found');
            return this.prisma.course.update({
                where: { id },
                data: { status: client_1.CourseStatus.DRAFT },
            });
        }
        if (type === 'artwork') {
            const artwork = await this.prisma.artwork.findUnique({ where: { id } });
            if (!artwork)
                throw new common_1.NotFoundException('Artwork not found');
            return this.prisma.artwork.update({
                where: { id },
                data: { status: client_1.ArtworkStatus.REJECTED },
            });
        }
        if (type === 'post') {
            const post = await this.prisma.post.findUnique({ where: { id } });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
            return this.prisma.post.update({
                where: { id },
                data: { status: client_1.PostStatus.HIDDEN },
            });
        }
        throw new common_1.BadRequestException('Invalid content type');
    }
    async batchApprove(dto) {
        const results = [];
        for (const id of dto.ids) {
            try {
                const course = await this.prisma.course.findUnique({ where: { id } });
                if (course) {
                    await this.approveContent(id, 'course', {});
                    results.push({ id, type: 'course', success: true });
                    continue;
                }
                const artwork = await this.prisma.artwork.findUnique({ where: { id } });
                if (artwork) {
                    await this.approveContent(id, 'artwork', {});
                    results.push({ id, type: 'artwork', success: true });
                    continue;
                }
                const post = await this.prisma.post.findUnique({ where: { id } });
                if (post) {
                    await this.approveContent(id, 'post', {});
                    results.push({ id, type: 'post', success: true });
                    continue;
                }
                results.push({ id, success: false, error: 'Not found' });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                results.push({ id, success: false, error: message });
            }
        }
        return results;
    }
    async batchReject(dto) {
        const results = [];
        for (const id of dto.ids) {
            try {
                const course = await this.prisma.course.findUnique({ where: { id } });
                if (course) {
                    await this.rejectContent(id, 'course', {
                        reason: dto.reason ?? 'Batch rejected',
                    });
                    results.push({ id, type: 'course', success: true });
                    continue;
                }
                const artwork = await this.prisma.artwork.findUnique({ where: { id } });
                if (artwork) {
                    await this.rejectContent(id, 'artwork', {
                        reason: dto.reason ?? 'Batch rejected',
                    });
                    results.push({ id, type: 'artwork', success: true });
                    continue;
                }
                const post = await this.prisma.post.findUnique({ where: { id } });
                if (post) {
                    await this.rejectContent(id, 'post', {
                        reason: dto.reason ?? 'Batch rejected',
                    });
                    results.push({ id, type: 'post', success: true });
                    continue;
                }
                results.push({ id, success: false, error: 'Not found' });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                results.push({ id, success: false, error: message });
            }
        }
        return results;
    }
};
exports.AdminContentService = AdminContentService;
exports.AdminContentService = AdminContentService = AdminContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminContentService);
//# sourceMappingURL=admin-content.service.js.map