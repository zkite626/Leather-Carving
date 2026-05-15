import { ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/create-product.dto';
export declare class ProductService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateProductDto): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    }>;
    findAll(query: QueryProductDto): Promise<{
        data: ({
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                parentId: string | null;
                icon: string | null;
                sortOrder: number;
            };
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                productId: string;
                url: string;
            }[];
        } & {
            name: string;
            id: string;
            status: import("@prisma/client").$Enums.ProductStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            originalPrice: Prisma.Decimal | null;
            merchantId: string;
            categoryId: string;
            description: string | null;
            coverImage: string | null;
            price: Prisma.Decimal;
            stock: number;
            stockAlert: number;
            sales: number;
            rating: Prisma.Decimal;
            isGuangxi: boolean;
            attributes: Prisma.JsonValue | null;
            tags: string[];
            version: number;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(slug: string): Promise<{
        reviews: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            images: string[];
            content: string | null;
            courseId: string | null;
            productId: string | null;
        })[];
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
        _count: {
            reviews: number;
        };
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    }>;
    findByMerchant(userId: string, query: QueryProductDto): Promise<{
        data: ({
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                parentId: string | null;
                icon: string | null;
                sortOrder: number;
            };
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                productId: string;
                url: string;
            }[];
        } & {
            name: string;
            id: string;
            status: import("@prisma/client").$Enums.ProductStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            originalPrice: Prisma.Decimal | null;
            merchantId: string;
            categoryId: string;
            description: string | null;
            coverImage: string | null;
            price: Prisma.Decimal;
            stock: number;
            stockAlert: number;
            sales: number;
            rating: Prisma.Decimal;
            isGuangxi: boolean;
            attributes: Prisma.JsonValue | null;
            tags: string[];
            version: number;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    }>;
    remove(id: string, userId: string): Promise<void>;
    addImages(productId: string, userId: string, imageUrls: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        productId: string;
        url: string;
    }[]>;
    reorderImages(productId: string, userId: string, imageIds: string[]): Promise<void>;
    deleteImage(productId: string, userId: string, imageId: string): Promise<void>;
    updateStatus(id: string, userId: string, status: ProductStatus): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    }>;
    checkStockAlert(productId: string): Promise<boolean>;
    getGuangxiProducts(limit?: number): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    })[]>;
    getHotProducts(limit?: number): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    })[]>;
    getNewProducts(limit?: number): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: Prisma.Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: Prisma.Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    })[]>;
    private generateSlug;
}
