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
var CommentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_DEPTH = 3;
let CommentService = CommentService_1 = class CommentService {
    prisma;
    logger = new common_1.Logger(CommentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateEntity(entityType, entityId) {
        if (entityType === 'artwork') {
            const artwork = await this.prisma.artwork.findUnique({
                where: { id: entityId, deletedAt: null },
            });
            if (!artwork)
                throw new common_1.NotFoundException('Artwork not found');
        }
        else if (entityType === 'post') {
            const post = await this.prisma.post.findUnique({
                where: { id: entityId, deletedAt: null },
            });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
        }
        else {
            throw new common_1.BadRequestException('Invalid entity type. Must be artwork or post');
        }
    }
    async checkDepth(parentId) {
        let depth = 0;
        let currentId = parentId;
        while (currentId && depth < MAX_DEPTH) {
            const row = await this.prisma.comment.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            });
            if (!row)
                break;
            currentId = row.parentId;
            depth++;
        }
        return depth;
    }
    async create(userId, entityType, entityId, dto) {
        await this.validateEntity(entityType, entityId);
        let depth = 0;
        if (dto.parentId) {
            const parent = await this.prisma.comment.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent)
                throw new common_1.NotFoundException('Parent comment not found');
            if (entityType === 'artwork' && parent.artworkId !== entityId) {
                throw new common_1.BadRequestException('Parent comment does not belong to this artwork');
            }
            if (entityType === 'post' && parent.postId !== entityId) {
                throw new common_1.BadRequestException('Parent comment does not belong to this post');
            }
            depth = await this.checkDepth(dto.parentId);
            if (depth >= MAX_DEPTH - 1) {
                throw new common_1.BadRequestException(`Maximum reply depth of ${MAX_DEPTH} levels exceeded`);
            }
        }
        const data = {
            user: { connect: { id: userId } },
            content: dto.content,
            ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
            ...(entityType === 'artwork'
                ? { artwork: { connect: { id: entityId } } }
                : { post: { connect: { id: entityId } } }),
        };
        const comment = await this.prisma.comment.create({
            data,
            include: {
                user: {
                    select: { id: true, nickname: true, avatar: true, role: true },
                },
            },
        });
        if (entityType === 'post') {
            await this.prisma.post.update({
                where: { id: entityId },
                data: { commentCount: { increment: 1 } },
            });
        }
        this.logger.log(`Comment created on ${entityType}/${entityId} by user ${userId}`);
        return comment;
    }
    async findByEntity(entityType, entityId, page = 1, pageSize = 20) {
        await this.validateEntity(entityType, entityId);
        const skip = (page - 1) * pageSize;
        const where = {
            deletedAt: null,
            parentId: null,
            ...(entityType === 'artwork'
                ? { artworkId: entityId }
                : { postId: entityId }),
        };
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                skip,
                take: pageSize,
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
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.comment.count({ where }),
        ]);
        return {
            data: comments,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async remove(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });
        if (comment.postId) {
            await this.prisma.post.update({
                where: { id: comment.postId },
                data: { commentCount: { decrement: 1 } },
            });
        }
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = CommentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentService);
//# sourceMappingURL=comment.service.js.map