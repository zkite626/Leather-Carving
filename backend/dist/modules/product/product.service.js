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
var ProductService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_PRODUCT_IMAGES = 10;
let ProductService = ProductService_1 = class ProductService {
    prisma;
    logger = new common_1.Logger(ProductService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const slug = dto.slug ?? this.generateSlug(dto.name);
        const existing = await this.prisma.product.findUnique({
            where: { slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Slug "${slug}" already exists`);
        }
        const category = await this.prisma.productCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const product = await this.prisma.product.create({
            data: {
                merchantId: userId,
                categoryId: dto.categoryId,
                name: dto.name,
                slug,
                description: dto.description,
                price: new client_1.Prisma.Decimal(dto.price),
                originalPrice: dto.originalPrice != null
                    ? new client_1.Prisma.Decimal(dto.originalPrice)
                    : undefined,
                stock: dto.stock ?? 0,
                stockAlert: dto.stockAlert ?? 0,
                isGuangxi: dto.isGuangxi ?? false,
                attributes: dto.attributes ?? undefined,
                tags: dto.tags ?? [],
                status: 'DRAFT',
            },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                category: true,
            },
        });
        this.logger.log(`Product created: ${product.id} by merchant ${userId}`);
        return product;
    }
    async findAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
        const skip = (page - 1) * pageSize;
        const where = {
            deletedAt: null,
            status: query.status ?? 'ON_SALE',
        };
        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }
        if (query.isGuangxi !== undefined) {
            where.isGuangxi = query.isGuangxi;
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined) {
                where.price.gte = new client_1.Prisma.Decimal(query.minPrice);
            }
            if (query.maxPrice !== undefined) {
                where.price.lte = new client_1.Prisma.Decimal(query.maxPrice);
            }
        }
        if (query.keyword) {
            where.OR = [
                { name: { contains: query.keyword, mode: 'insensitive' } },
                { description: { contains: query.keyword, mode: 'insensitive' } },
            ];
        }
        const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
        let orderBy = {
            createdAt: 'desc',
        };
        if (query.sortBy === 'sales')
            orderBy = { sales: sortOrder };
        if (query.sortBy === 'price')
            orderBy = { price: sortOrder };
        if (query.sortBy === 'rating')
            orderBy = { rating: sortOrder };
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: pageSize,
                orderBy,
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    category: true,
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async findOne(slug) {
        const product = await this.prisma.product.findUnique({
            where: { slug, deletedAt: null },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                category: true,
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                    include: {
                        user: {
                            select: { id: true, nickname: true, avatar: true },
                        },
                    },
                },
                _count: { select: { reviews: true } },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async findByMerchant(userId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
        const skip = (page - 1) * pageSize;
        const where = {
            merchantId: userId,
            deletedAt: null,
        };
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    category: true,
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async update(id, userId, dto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.merchantId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        if (dto.slug) {
            const existing = await this.prisma.product.findUnique({
                where: { slug: dto.slug },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Slug "${dto.slug}" already exists`);
            }
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                categoryId: dto.categoryId,
                price: dto.price != null ? new client_1.Prisma.Decimal(dto.price) : undefined,
                originalPrice: dto.originalPrice != null
                    ? new client_1.Prisma.Decimal(dto.originalPrice)
                    : undefined,
                stock: dto.stock,
                stockAlert: dto.stockAlert,
                isGuangxi: dto.isGuangxi,
                attributes: dto.attributes ?? undefined,
                tags: dto.tags,
            },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                category: true,
            },
        });
    }
    async remove(id, userId) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.merchantId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async addImages(productId, userId, imageUrls) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { images: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.merchantId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        const currentCount = product.images.length;
        if (currentCount + imageUrls.length > MAX_PRODUCT_IMAGES) {
            throw new common_1.BadRequestException(`Maximum ${MAX_PRODUCT_IMAGES} images allowed. Currently: ${currentCount}`);
        }
        const images = await Promise.all(imageUrls.map((url, index) => this.prisma.productImage.create({
            data: {
                productId,
                url,
                sortOrder: currentCount + index,
            },
        })));
        if (currentCount === 0 && imageUrls.length > 0) {
            await this.prisma.product.update({
                where: { id: productId },
                data: { coverImage: imageUrls[0] },
            });
        }
        return images;
    }
    async reorderImages(productId, userId, imageIds) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.merchantId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        await Promise.all(imageIds.map((id, index) => this.prisma.productImage.update({
            where: { id },
            data: { sortOrder: index },
        })));
    }
    async deleteImage(productId, userId, imageId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { images: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.merchantId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        const image = product.images.find((img) => img.id === imageId);
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        await this.prisma.productImage.delete({ where: { id: imageId } });
        if (product.coverImage === image.url) {
            const remaining = product.images.filter((img) => img.id !== imageId);
            await this.prisma.product.update({
                where: { id: productId },
                data: { coverImage: remaining[0]?.url ?? null },
            });
        }
    }
    async updateStatus(id, userId, status) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.merchantId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        return this.prisma.product.update({
            where: { id },
            data: { status },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                category: true,
            },
        });
    }
    async checkStockAlert(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, stockAlert: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product.stock <= product.stockAlert;
    }
    async getGuangxiProducts(limit = 8) {
        return this.prisma.product.findMany({
            where: {
                isGuangxi: true,
                status: 'ON_SALE',
                deletedAt: null,
            },
            take: limit,
            orderBy: { sales: 'desc' },
            include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                category: true,
            },
        });
    }
    async getHotProducts(limit = 8) {
        return this.prisma.product.findMany({
            where: {
                status: 'ON_SALE',
                deletedAt: null,
            },
            take: limit,
            orderBy: { sales: 'desc' },
            include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                category: true,
            },
        });
    }
    async getNewProducts(limit = 8) {
        return this.prisma.product.findMany({
            where: {
                status: 'ON_SALE',
                deletedAt: null,
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                category: true,
            },
        });
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w一-鿿]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 200);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = ProductService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map