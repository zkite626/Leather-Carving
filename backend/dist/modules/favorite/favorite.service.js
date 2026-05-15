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
var FavoriteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const VALID_ENTITY_TYPES = ['course', 'artwork', 'post'];
let FavoriteService = FavoriteService_1 = class FavoriteService {
    prisma;
    logger = new common_1.Logger(FavoriteService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async toggle(userId, entityType, entityId) {
        if (!VALID_ENTITY_TYPES.includes(entityType)) {
            throw new common_1.NotFoundException(`Invalid entity type: ${entityType}`);
        }
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_entityType_entityId: { userId, entityType, entityId },
            },
        });
        if (existing) {
            await this.prisma.favorite.delete({ where: { id: existing.id } });
            if (entityType === 'artwork') {
                await this.prisma.artwork.update({
                    where: { id: entityId },
                    data: { likeCount: { decrement: 1 } },
                });
            }
            else if (entityType === 'post') {
                await this.prisma.post.update({
                    where: { id: entityId },
                    data: { likeCount: { decrement: 1 } },
                });
            }
            this.logger.log(`Favorite removed: ${entityType}/${entityId} by user ${userId}`);
            return { favorited: false };
        }
        await this.prisma.favorite.create({
            data: { userId, entityType, entityId },
        });
        if (entityType === 'artwork') {
            await this.prisma.artwork.update({
                where: { id: entityId },
                data: { likeCount: { increment: 1 } },
            });
        }
        else if (entityType === 'post') {
            await this.prisma.post.update({
                where: { id: entityId },
                data: { likeCount: { increment: 1 } },
            });
        }
        this.logger.log(`Favorite added: ${entityType}/${entityId} by user ${userId}`);
        return { favorited: true };
    }
    async check(userId, entityType, entityId) {
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_entityType_entityId: { userId, entityType, entityId },
            },
        });
        return { favorited: !!existing };
    }
    async getMyFavorites(userId, entityType, page = 1, pageSize = 20) {
        const skip = (page - 1) * pageSize;
        const where = { userId };
        if (entityType)
            where.entityType = entityType;
        const [favorites, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.favorite.count({ where }),
        ]);
        return {
            data: favorites,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
};
exports.FavoriteService = FavoriteService;
exports.FavoriteService = FavoriteService = FavoriteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoriteService);
//# sourceMappingURL=favorite.service.js.map