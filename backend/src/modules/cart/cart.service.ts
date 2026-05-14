import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/create-cart.dto';

const MAX_CART_ITEMS = 50;

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.status !== 'ON_SALE') {
      throw new BadRequestException('Product is not available for purchase');
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId: dto.productId },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, in cart: ${existingItem.quantity}`,
        );
      }
      if (newQuantity > 99) {
        throw new BadRequestException('Maximum quantity per item is 99');
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

      this.logger.log(
        `Cart item updated: ${existingItem.id} qty ${newQuantity} by user ${userId}`,
      );
      return updated;
    }

    const cartItemCount = await this.prisma.cartItem.count({
      where: { userId },
    });
    if (cartItemCount >= MAX_CART_ITEMS) {
      throw new BadRequestException(
        `Cart limit reached. Maximum ${MAX_CART_ITEMS} unique items allowed`,
      );
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}`,
      );
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

    this.logger.log(
      `Cart item added: product ${dto.productId} qty ${dto.quantity} by user ${userId}`,
    );
    return created;
  }

  async getCart(userId: string) {
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

  async updateQuantity(userId: string, itemId: string, dto: UpdateCartDto) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > cartItem.product.stock) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.product.stock}`,
      );
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

    this.logger.log(
      `Cart item ${itemId} quantity updated to ${dto.quantity} by user ${userId}`,
    );
    return updated;
  }

  async removeItem(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    this.logger.log(`Cart item removed: ${itemId} by user ${userId}`);
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const deleteResult = await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    this.logger.log(
      `Cart cleared for user ${userId}: ${deleteResult.count} items removed`,
    );
    return { message: 'Cart cleared', count: deleteResult.count };
  }

  async getCartCount(userId: string) {
    const count = await this.prisma.cartItem.count({
      where: { userId },
    });
    return { count };
  }

  async validateCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    const invalidItems: {
      id: string;
      productId: string;
      reason: string;
    }[] = [];

    for (const item of items) {
      if (!item.product || item.product.deletedAt) {
        invalidItems.push({
          id: item.id,
          productId: item.productId,
          reason: 'Product no longer exists',
        });
      } else if (item.product.status !== 'ON_SALE') {
        invalidItems.push({
          id: item.id,
          productId: item.productId,
          reason: 'Product is no longer on sale',
        });
      } else if (item.quantity > item.product.stock) {
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
}
