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
var BannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BannerService = BannerService_1 = class BannerService {
    prisma;
    logger = new common_1.Logger(BannerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(position) {
        const now = new Date();
        const where = {
            isActive: true,
            OR: [
                { startAt: null },
                { startAt: { lte: now } },
            ],
            AND: [
                { OR: [{ endAt: null }, { endAt: { gte: now } }] },
            ],
            ...(position ? { position } : {}),
        };
        return this.prisma.banner.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findAllAdmin() {
        return this.prisma.banner.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findOne(id) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return banner;
    }
    async create(dto) {
        const banner = await this.prisma.banner.create({
            data: {
                title: dto.title,
                image: dto.image,
                link: dto.link,
                position: dto.position ?? 'home',
                sortOrder: dto.sortOrder ?? 0,
                isActive: dto.isActive ?? true,
                startAt: dto.startAt ? new Date(dto.startAt) : null,
                endAt: dto.endAt ? new Date(dto.endAt) : null,
            },
        });
        this.logger.log(`Banner created: ${banner.id}`);
        return banner;
    }
    async update(id, dto) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return this.prisma.banner.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.image !== undefined && { image: dto.image }),
                ...(dto.link !== undefined && { link: dto.link }),
                ...(dto.position !== undefined && { position: dto.position }),
                ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.startAt !== undefined && {
                    startAt: dto.startAt ? new Date(dto.startAt) : null,
                }),
                ...(dto.endAt !== undefined && {
                    endAt: dto.endAt ? new Date(dto.endAt) : null,
                }),
            },
        });
    }
    async remove(id) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        await this.prisma.banner.delete({ where: { id } });
    }
};
exports.BannerService = BannerService;
exports.BannerService = BannerService = BannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BannerService);
//# sourceMappingURL=banner.service.js.map