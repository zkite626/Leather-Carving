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
var PatternService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PatternService = PatternService_1 = class PatternService {
    prisma;
    logger = new common_1.Logger(PatternService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const pattern = await this.prisma.patternAsset.create({
            data: {
                name: dto.name,
                category: dto.category,
                imageUrl: dto.imageUrl,
                thumbnailUrl: dto.thumbnailUrl,
                description: dto.description,
                origin: dto.origin,
                tags: dto.tags ?? [],
            },
        });
        this.logger.log(`PatternAsset created: ${pattern.id}`);
        return pattern;
    }
    async findAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
        const skip = (page - 1) * pageSize;
        const where = {};
        if (query.category) {
            where.category = query.category;
        }
        if (query.keyword) {
            where.OR = [
                { name: { contains: query.keyword, mode: 'insensitive' } },
                { description: { contains: query.keyword, mode: 'insensitive' } },
            ];
        }
        const [patterns, total] = await Promise.all([
            this.prisma.patternAsset.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.patternAsset.count({ where }),
        ]);
        return {
            data: patterns,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async findOne(id) {
        const pattern = await this.prisma.patternAsset.findUnique({
            where: { id },
        });
        if (!pattern)
            throw new common_1.NotFoundException('Pattern not found');
        return pattern;
    }
    async update(id, dto) {
        const pattern = await this.prisma.patternAsset.findUnique({
            where: { id },
        });
        if (!pattern)
            throw new common_1.NotFoundException('Pattern not found');
        return this.prisma.patternAsset.update({
            where: { id },
            data: {
                name: dto.name,
                category: dto.category,
                imageUrl: dto.imageUrl,
                thumbnailUrl: dto.thumbnailUrl,
                description: dto.description,
                origin: dto.origin,
                tags: dto.tags,
            },
        });
    }
    async remove(id) {
        const pattern = await this.prisma.patternAsset.findUnique({
            where: { id },
        });
        if (!pattern)
            throw new common_1.NotFoundException('Pattern not found');
        await this.prisma.patternAsset.delete({ where: { id } });
    }
    async incrementDownload(id) {
        return this.prisma.patternAsset.update({
            where: { id },
            data: { downloadCount: { increment: 1 } },
        });
    }
};
exports.PatternService = PatternService;
exports.PatternService = PatternService = PatternService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatternService);
//# sourceMappingURL=pattern.service.js.map