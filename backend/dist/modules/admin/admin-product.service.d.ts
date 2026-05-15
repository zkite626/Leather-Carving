import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto } from './dto';
import { Prisma } from '@prisma/client';
interface CreateProductInput {
    name: string;
    categoryId: string;
    price: number;
    originalPrice?: number;
    description?: string;
    stock?: number;
    isGuangxi?: boolean;
    tags?: string[];
    coverImage?: string;
    merchantId?: string;
}
interface UpdateProductInput {
    name?: string;
    categoryId?: string;
    price?: number;
    originalPrice?: number | null;
    description?: string;
    stock?: number;
    isGuangxi?: boolean;
    tags?: string[];
    coverImage?: string;
}
export declare class AdminProductService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private generateSlug;
    getProducts(query: ProductQueryDto): Promise<{
        items: {
            price: string;
            originalPrice: string | null;
            rating: string;
            merchant: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
            category: {
                name: string;
                id: string;
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
                orderItems: number;
            };
            name: string;
            id: string;
            status: import("@prisma/client").$Enums.ProductStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            merchantId: string;
            categoryId: string;
            description: string | null;
            coverImage: string | null;
            stock: number;
            stockAlert: number;
            sales: number;
            isGuangxi: boolean;
            attributes: Prisma.JsonValue | null;
            tags: string[];
            version: number;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProductById(id: string): Promise<{
        merchant: {
            id: string;
            email: string;
            nickname: string;
            avatar: string | null;
        };
        category: {
            name: string;
            id: string;
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
            orderItems: number;
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
    createProduct(dto: CreateProductInput): Promise<{
        price: string;
        originalPrice: string | null;
        merchant: {
            id: string;
            nickname: string;
        };
        category: {
            name: string;
            id: string;
        };
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    }>;
    updateProduct(id: string, dto: UpdateProductInput): Promise<{
        price: string;
        originalPrice: string | null;
        merchant: {
            id: string;
            nickname: string;
        };
        category: {
            name: string;
            id: string;
        };
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: Prisma.Decimal;
        isGuangxi: boolean;
        attributes: Prisma.JsonValue | null;
        tags: string[];
        version: number;
    }>;
    updateProductStatus(id: string, status: string): Promise<{
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
    deleteProduct(id: string): Promise<{
        message: string;
    }>;
    getCategories(): Promise<{
        name: string;
        id: string;
        parentId: string | null;
        icon: string | null;
    }[]>;
}
export {};
