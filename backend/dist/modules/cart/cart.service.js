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
var CartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_CART_ITEMS = 50;
let CartService = CartService_1 = class CartService {
    prisma;
    logger = new common_1.Logger(CartService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addItem(userId, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId, deletedAt: null },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.status !== 'ON_SALE') {
            throw new common_1.BadRequestException('Product is not available for purchase');
        }
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId: { userId, productId: dto.productId },
            },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + dto.quantity;
            if (newQuantity > product.stock) {
                throw new common_1.BadRequestException(`Insufficient stock. Available: ${product.stock}, in cart: ${existingItem.quantity}`);
            }
            if (newQuantity > 99) {
                throw new common_1.BadRequestException('Maximum quantity per item is 99');
            }
            const updated = await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
                include: {
                    product: {
                        include: {
                            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                            category: true,
                        },
                    },
                },
            });
            this.logger.log(`Cart item updated: ${existingItem.id} qty ${newQuantity} by user ${userId}`);
            return updated;
        }
        const cartItemCount = await this.prisma.cartItem.count({
            where: { userId },
        });
        if (cartItemCount >= MAX_CART_ITEMS) {
            throw new common_1.BadRequestException(`Cart limit reached. Maximum ${MAX_CART_ITEMS} unique items allowed`);
        }
        if (dto.quantity > product.stock) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${product.stock}`);
        }
        const created = await this.prisma.cartItem.create({
            data: {
                userId,
                productId: dto.productId,
                quantity: dto.quantity,
            },
            include: {
                product: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                        category: true,
                    },
                },
            },
        });
        this.logger.log(`Cart item added: product ${dto.productId} qty ${dto.quantity} by user ${userId}`);
        return created;
    }
    async getCart(userId) {
        const items = await this.prisma.cartItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                        category: true,
                    },
                },
            },
        });
        return {
            items,
            total: items.length,
        };
    }
    async updateQuantity(userId, itemId, dto) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { product: true },
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (dto.quantity > cartItem.product.stock) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${cartItem.product.stock}`);
        }
        const updated = await this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
            include: {
                product: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                        category: true,
                    },
                },
            },
        });
        this.logger.log(`Cart item ${itemId} quantity updated to ${dto.quantity} by user ${userId}`);
        return updated;
    }
    async removeItem(userId, itemId) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.delete({ where: { id: itemId } });
        this.logger.log(`Cart item removed: ${itemId} by user ${userId}`);
        return { message: 'Item removed from cart' };
    }
    async clearCart(userId) {
        const deleteResult = await this.prisma.cartItem.deleteMany({
            where: { userId },
        });
        this.logger.log(`Cart cleared for user ${userId}: ${deleteResult.count} items removed`);
        return { message: 'Cart cleared', count: deleteResult.count };
    }
    async getCartCount(userId) {
        const count = await this.prisma.cartItem.count({
            where: { userId },
        });
        return { count };
    }
    async validateCart(userId) {
        const items = await this.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: true,
            },
        });
        const invalidItems = [];
        for (const item of items) {
            if (!item.product || item.product.deletedAt) {
                invalidItems.push({
                    id: item.id,
                    productId: item.productId,
                    reason: 'Product no longer exists',
                });
            }
            else if (item.product.status !== 'ON_SALE') {
                invalidItems.push({
                    id: item.id,
                    productId: item.productId,
                    reason: 'Product is no longer on sale',
                });
            }
            else if (item.quantity > item.product.stock) {
                invalidItems.push({
                    id: item.id,
                    productId: item.productId,
                    reason: `Insufficient stock. Available: ${item.product.stock}, requested: ${item.quantity}`,
                });
            }
        }
        return {
            valid: invalidItems.length === 0,
            invalidItems,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = CartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map