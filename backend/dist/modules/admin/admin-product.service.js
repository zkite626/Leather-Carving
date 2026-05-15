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
var AdminProductService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminProductService = AdminProductService_1 = class AdminProductService {
    prisma;
    logger = new common_1.Logger(AdminProductService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w一-鿿]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 200) || `product-${Date.now()}`;
    }
    async getProducts(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {
            deletedAt: null,
            ...(query.keyword && {
                OR: [
                    { name: { contains: query.keyword, mode: 'insensitive' } },
                    { description: { contains: query.keyword, mode: 'insensitive' } },
                ],
            }),
            ...(query.status && { status: query.status }),
        };
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    merchant: { select: { id: true, nickname: true, avatar: true } },
                    category: { select: { id: true, name: true } },
                    images: { take: 1, orderBy: { sortOrder: 'asc' } },
                    _count: { select: { orderItems: true, reviews: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items: products.map((p) => ({
                ...p,
                price: String(p.price),
                originalPrice: p.originalPrice ? String(p.originalPrice) : null,
                rating: String(p.rating),
            })),
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }
    async getProductById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                merchant: { select: { id: true, nickname: true, avatar: true, email: true } },
                category: { select: { id: true, name: true } },
                images: { orderBy: { sortOrder: 'asc' } },
                _count: { select: { orderItems: true, reviews: true } },
            },
        });
        if (!product || product.deletedAt)
            throw new common_1.NotFoundException('商品不存在');
        return product;
    }
    async createProduct(dto) {
        const slug = this.generateSlug(dto.name);
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException('商品 slug 已存在');
        const category = await this.prisma.productCategory.findUnique({ where: { id: dto.categoryId } });
        if (!category)
            throw new common_1.NotFoundException('分类不存在');
        let merchantId = dto.merchantId;
        if (!merchantId) {
            const admin = await this.prisma.user.findFirst({
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                select: { id: true },
            });
            if (!admin)
                throw new common_1.NotFoundException('未找到管理员账号');
            merchantId = admin.id;
        }
        const product = await this.prisma.product.create({
            data: {
                merchantId,
                categoryId: dto.categoryId,
                name: dto.name,
                slug,
                description: dto.description,
                price: new client_1.Prisma.Decimal(dto.price),
                originalPrice: dto.originalPrice != null ? new client_1.Prisma.Decimal(dto.originalPrice) : null,
                stock: dto.stock ?? 0,
                isGuangxi: dto.isGuangxi ?? false,
                tags: dto.tags ?? [],
                coverImage: dto.coverImage,
                status: 'DRAFT',
            },
            include: {
                category: { select: { id: true, name: true } },
                merchant: { select: { id: true, nickname: true } },
            },
        });
        this.logger.log(`Admin created product: ${product.name} (${product.id})`);
        return { ...product, price: String(product.price), originalPrice: product.originalPrice ? String(product.originalPrice) : null };
    }
    async updateProduct(id, dto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt)
            throw new common_1.NotFoundException('商品不存在');
        if (dto.categoryId) {
            const category = await this.prisma.productCategory.findUnique({ where: { id: dto.categoryId } });
            if (!category)
                throw new common_1.NotFoundException('分类不存在');
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.price !== undefined && { price: new client_1.Prisma.Decimal(dto.price) }),
                ...(dto.originalPrice !== undefined && {
                    originalPrice: dto.originalPrice != null ? new client_1.Prisma.Decimal(dto.originalPrice) : null,
                }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.stock !== undefined && { stock: dto.stock }),
                ...(dto.isGuangxi !== undefined && { isGuangxi: dto.isGuangxi }),
                ...(dto.tags !== undefined && { tags: dto.tags }),
                ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
            },
            include: {
                category: { select: { id: true, name: true } },
                merchant: { select: { id: true, nickname: true } },
            },
        });
        this.logger.log(`Admin updated product: ${id}`);
        return { ...updated, price: String(updated.price), originalPrice: updated.originalPrice ? String(updated.originalPrice) : null };
    }
    async updateProductStatus(id, status) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt)
            throw new common_1.NotFoundException('商品不存在');
        const updated = await this.prisma.product.update({
            where: { id },
            data: { status: status },
        });
        this.logger.log(`Product ${id} status changed: ${product.status} -> ${status}`);
        return updated;
    }
    async deleteProduct(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt)
            throw new common_1.NotFoundException('商品不存在');
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        this.logger.log(`Admin deleted product: ${id}`);
        return { message: '商品已删除' };
    }
    async getCategories() {
        return this.prisma.productCategory.findMany({
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true, parentId: true, icon: true },
        });
    }
};
exports.AdminProductService = AdminProductService;
exports.AdminProductService = AdminProductService = AdminProductService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminProductService);
//# sourceMappingURL=admin-product.service.js.map