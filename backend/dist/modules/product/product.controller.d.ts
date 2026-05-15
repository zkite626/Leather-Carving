import { ProductStatus } from '@prisma/client';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto, AddProductImagesDto } from './dto/create-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
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
            originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
            merchantId: string;
            categoryId: string;
            description: string | null;
            coverImage: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            stockAlert: number;
            sales: number;
            rating: import("@prisma/client-runtime-utils").Decimal;
            isGuangxi: boolean;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
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
    getGuangxiProducts(): Promise<({
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    })[]>;
    getHotProducts(): Promise<({
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    })[]>;
    getNewProducts(): Promise<({
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    })[]>;
    findMy(userId: string, query: QueryProductDto): Promise<{
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
            originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
            merchantId: string;
            categoryId: string;
            description: string | null;
            coverImage: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            stockAlert: number;
            sales: number;
            rating: import("@prisma/client-runtime-utils").Decimal;
            isGuangxi: boolean;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
    remove(id: string, userId: string): Promise<void>;
    addImages(id: string, userId: string, dto: AddProductImagesDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        productId: string;
        url: string;
    }[]>;
    reorderImages(id: string, userId: string, body: {
        imageIds: string[];
    }): Promise<void>;
    deleteImage(id: string, imageId: string, userId: string): Promise<void>;
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
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
}
