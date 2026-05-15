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
var CategoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoryService = CategoryService_1 = class CategoryService {
    prisma;
    logger = new common_1.Logger(CategoryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const categories = await this.prisma.productCategory.findMany({
            where: { parentId: null },
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: { select: { products: true } },
                children: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        _count: { select: { products: true } },
                        children: {
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                _count: { select: { products: true } },
                            },
                        },
                    },
                },
            },
        });
        return categories;
    }
    async findOne(id) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
            include: {
                _count: { select: { products: true } },
                children: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        _count: { select: { products: true } },
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async create(dto) {
        if (dto.parentId) {
            const parent = await this.prisma.productCategory.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        const category = await this.prisma.productCategory.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                icon: dto.icon,
                parentId: dto.parentId,
                sortOrder: dto.sortOrder ?? 0,
            },
            include: {
                _count: { select: { products: true } },
            },
        });
        this.logger.log(`Category created: ${category.id}`);
        return category;
    }
    async update(id, dto) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
            include: { children: true },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('Category cannot be its own parent');
            }
            const isDescendant = await this.isDescendant(id, dto.parentId);
            if (isDescendant) {
                throw new common_1.BadRequestException('Cannot set a descendant as parent (circular reference)');
            }
            const parent = await this.prisma.productCategory.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        return this.prisma.productCategory.update({
            where: { id },
            data: {
                name: dto.name,
                slug: dto.slug,
                icon: dto.icon,
                parentId: dto.parentId,
                sortOrder: dto.sortOrder,
            },
            include: {
                _count: { select: { products: true } },
            },
        });
    }
    async remove(id) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
            include: {
                children: true,
                _count: { select: { products: true } },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category.children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with children. Remove children first.');
        }
        if (category._count.products > 0) {
            throw new common_1.BadRequestException('Cannot delete category with products. Reassign products first.');
        }
        await this.prisma.productCategory.delete({ where: { id } });
    }
    async isDescendant(ancestorId, candidateDescendantId) {
        const children = await this.prisma.productCategory.findMany({
            where: { parentId: ancestorId },
            select: { id: true },
        });
        for (const child of children) {
            if (child.id === candidateDescendantId) {
                return true;
            }
            const found = await this.isDescendant(child.id, candidateDescendantId);
            if (found)
                return true;
        }
        return false;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = CategoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoryService);
//# sourceMappingURL=category.service.js.map