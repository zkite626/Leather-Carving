import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderQueryDto, UpdateOrderStatusDto } from './dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminOrderService {
  private readonly logger = new Logger(AdminOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOrders(query: OrderQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.keyword && {
        OR: [
          { orderNo: { contains: query.keyword, mode: 'insensitive' } },
          {
            user: {
              nickname: { contains: query.keyword, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true, email: true },
          },
          items: true,
          payments: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PAID]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [OrderStatus.REFUNDING],
      [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
    };

    const allowed = validTransitions[order.status] ?? [];
    const targetStatus = dto.status as OrderStatus;
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const updateData: Prisma.OrderUpdateInput = {
      status: targetStatus,
    };

    if (targetStatus === OrderStatus.SHIPPING) {
      updateData.shippedAt = new Date();
    } else if (targetStatus === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (targetStatus === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, nickname: true, email: true } },
        items: true,
      },
    });

    this.logger.log(
      `Order ${order.orderNo} status: ${order.status} -> ${dto.status}`,
    );
    return updated;
  }
}
