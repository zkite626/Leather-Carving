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
var ArtworkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtworkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_IMAGES = 9;
let ArtworkService = ArtworkService_1 = class ArtworkService {
    prisma;
    logger = new common_1.Logger(ArtworkService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const artwork = await this.prisma.artwork.create({
            data: {
                userId,
                title: dto.title,
                description: dto.description,
                category: dto.category,
                techniques: dto.techniques ?? [],
                materials: dto.materials ?? [],
                tags: dto.tags ?? [],
                story: dto.story,
                status: 'DRAFT',
            },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                user: {
                    select: { id: true, nickname: true, avatar: true, role: true },
                },
            },
        });
        this.logger.log(`Artwork created: ${artwork.id} by user ${userId}`);
        return artwork;
    }
    async addImages(artworkId, userId, imageUrls) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id: artworkId },
            include: { images: true },
        });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        const currentCount = artwork.images.length;
        if (currentCount + imageUrls.length > MAX_IMAGES) {
            throw new common_1.BadRequestException(`Maximum ${MAX_IMAGES} images allowed. Currently: ${currentCount}`);
        }
        const images = await Promise.all(imageUrls.map((url, index) => this.prisma.artworkImage.create({
            data: {
                artworkId,
                url,
                sortOrder: currentCount + index,
            },
        })));
        if (currentCount === 0 && imageUrls.length > 0) {
            await this.prisma.artwork.update({
                where: { id: artworkId },
                data: { coverImage: imageUrls[0] },
            });
        }
        return images;
    }
    async setCoverImage(artworkId, userId, imageId) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id: artworkId },
            include: { images: true },
        });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        const image = artwork.images.find((img) => img.id === imageId);
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        await this.prisma.artwork.update({
            where: { id: artworkId },
            data: { coverImage: image.url },
        });
        return { message: 'Cover image updated' };
    }
    async deleteImage(artworkId, userId, imageId) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id: artworkId },
            include: { images: true },
        });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        const image = artwork.images.find((img) => img.id === imageId);
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        await this.prisma.artworkImage.delete({ where: { id: imageId } });
        if (artwork.coverImage === image.url) {
            const remaining = artwork.images.filter((img) => img.id !== imageId);
            await this.prisma.artwork.update({
                where: { id: artworkId },
                data: { coverImage: remaining[0]?.url ?? null },
            });
        }
    }
    async reorderImages(artworkId, userId, imageIds) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id: artworkId },
        });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        await Promise.all(imageIds.map((id, index) => this.prisma.artworkImage.update({
            where: { id },
            data: { sortOrder: index },
        })));
    }
    async submitForReview(artworkId, userId) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id: artworkId },
        });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        if (artwork.status !== 'DRAFT' && artwork.status !== 'REJECTED') {
            throw new common_1.BadRequestException('Only draft or rejected artworks can be submitted');
        }
        return this.prisma.artwork.update({
            where: { id: artworkId },
            data: { status: 'REVIEWING' },
        });
    }
    async findAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
        const skip = (page - 1) * pageSize;
        const where = {
            status: 'PUBLISHED',
            deletedAt: null,
        };
        if (query.category) {
            where.category = query.category;
        }
        if (query.keyword) {
            where.OR = [
                { title: { contains: query.keyword, mode: 'insensitive' } },
                { description: { contains: query.keyword, mode: 'insensitive' } },
            ];
        }
        if (query.techniques) {
            const techArr = query.techniques.split(',').map((t) => t.trim());
            where.techniques = { hasSome: techArr };
        }
        let orderBy = { createdAt: 'desc' };
        if (query.sortBy === 'likeCount')
            orderBy = { likeCount: 'desc' };
        if (query.sortBy === 'viewCount')
            orderBy = { viewCount: 'desc' };
        const [artworks, total] = await Promise.all([
            this.prisma.artwork.findMany({
                where,
                skip,
                take: pageSize,
                orderBy,
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    user: {
                        select: { id: true, nickname: true, avatar: true, role: true },
                    },
                },
            }),
            this.prisma.artwork.count({ where }),
        ]);
        return {
            data: artworks,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async findOne(id, incrementView = false) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id, deletedAt: null },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                user: {
                    select: { id: true, nickname: true, avatar: true, role: true },
                },
                comments: {
                    where: { parentId: null, deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, nickname: true, avatar: true, role: true },
                        },
                        replies: {
                            where: { deletedAt: null },
                            orderBy: { createdAt: 'asc' },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        nickname: true,
                                        avatar: true,
                                        role: true,
                                    },
                                },
                                replies: {
                                    where: { deletedAt: null },
                                    orderBy: { createdAt: 'asc' },
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
                    },
                },
            },
        });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (incrementView) {
            await this.prisma.artwork.update({
                where: { id },
                data: { viewCount: { increment: 1 } },
            });
        }
        return artwork;
    }
    async findByUser(userId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
        const skip = (page - 1) * pageSize;
        const where = { userId, deletedAt: null };
        const [artworks, total] = await Promise.all([
            this.prisma.artwork.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
            }),
            this.prisma.artwork.count({ where }),
        ]);
        return {
            data: artworks,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async update(id, userId, dto) {
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        return this.prisma.artwork.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                techniques: dto.techniques,
                materials: dto.materials,
                tags: dto.tags,
                story: dto.story,
            },
        });
    }
    async remove(id, userId) {
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (!artwork)
            throw new common_1.NotFoundException('Artwork not found');
        if (artwork.userId !== userId)
            throw new common_1.ForbiddenException('Not your artwork');
        await this.prisma.artwork.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getRelated(id, limit = 6) {
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (!artwork)
            return [];
        return this.prisma.artwork.findMany({
            where: {
                id: { not: id },
                status: 'PUBLISHED',
                deletedAt: null,
                OR: [
                    { techniques: { hasSome: artwork.techniques } },
                    { userId: artwork.userId },
                ],
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                user: {
                    select: { id: true, nickname: true, avatar: true, role: true },
                },
            },
        });
    }
};
exports.ArtworkService = ArtworkService;
exports.ArtworkService = ArtworkService = ArtworkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArtworkService);
//# sourceMappingURL=artwork.service.js.map