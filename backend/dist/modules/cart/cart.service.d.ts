import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/create-cart.dto';
export declare class CartService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    addItem(userId: string, dto: AddToCartDto): Promise<{
        product: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        productId: string;
        quantity: number;
    }>;
    getCart(userId: string): Promise<{
        items: ({
            product: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            productId: string;
            quantity: number;
        })[];
        total: number;
    }>;
    updateQuantity(userId: string, itemId: string, dto: UpdateCartDto): Promise<{
        product: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        productId: string;
        quantity: number;
    }>;
    removeItem(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
        count: number;
    }>;
    getCartCount(userId: string): Promise<{
        count: number;
    }>;
    validateCart(userId: string): Promise<{
        valid: boolean;
        invalidItems: {
            id: string;
            productId: string;
            reason: string;
        }[];
    }>;
}
