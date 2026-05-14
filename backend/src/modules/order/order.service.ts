import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { OrderStatus, ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, QueryOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist and are on sale
    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      if (product.status !== ProductStatus.ON_SALE) {
        throw new BadRequestException(
          `Product "${product.name}" is not available for purchase`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Product "${product.name}" has insufficient stock (available: ${product.stock})`,
        );
      }
    }

    // Calculate total
    let totalAmount = new Prisma.Decimal(0);
    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      totalAmount = totalAmount.add(
        new Prisma.Decimal(product.price).mul(item.quantity),
      );
    }

    const orderNo = await this.generateOrderNo();

    // Execute everything in a transaction with optimistic locking
    const order = await this.prisma.$transaction(async (tx) => {
      // Deduct stock with optimistic locking
      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const result = await tx.$executeRaw`
          UPDATE products
          SET stock = stock - ${item.quantity},
              sales = sales + ${item.quantity},
              version = version + 1
          WHERE id = ${item.productId}
            AND version = ${product.version}
            AND stock >= ${item.quantity}
        `;

        if (result === 0) {
          throw new BadRequestException(
            `Product "${product.name}" stock changed or insufficient. Please retry.`,
          );
        }
      }

      // Create order with items
      return tx.order.create({
        data: {
          orderNo,
          userId,
          totalAmount,
          payAmount: totalAmount,
          status: OrderStatus.PENDING,
          address: dto.address as unknown as Prisma.InputJsonValue,
          remark: dto.remark,
          items: {
            create: dto.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                productName: product.name,
                productImage: product.coverImage,
                price: product.price,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });
    });

    this.logger.log(`Order created: ${order.id}, orderNo: ${orderNo}`);
    return order;
  }

  async findAll(userId: string, query: QueryOrderDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  coverImage: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                coverImage: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      // Rollback stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sales: { decrement: item.quantity },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: { items: true },
      });
    });

    this.logger.log(`Order cancelled: ${orderId}`);
    return cancelledOrder;
  }

  async confirmReceipt(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.SHIPPING) {
      throw new BadRequestException(
        'Only shipping orders can be confirmed as received',
      );
    }

    const completedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: { items: true },
    });

    this.logger.log(`Order receipt confirmed: ${orderId}`);
    return completedOrder;
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    data?: { shippedAt?: Date; completedAt?: Date; cancelledAt?: Date },
  ) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...data,
      },
    });
  }

  async generateOrderNo(): Promise<string> {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    let orderNo: string;
    let exists: boolean;

    do {
      const random = Math.floor(1000 + Math.random() * 9000).toString();
      orderNo = `LC${dateStr}${random}`;

      const existing = await this.prisma.order.findUnique({
        where: { orderNo },
        select: { id: true },
      });
      exists = !!existing;
    } while (exists);

    return orderNo;
  }
}
