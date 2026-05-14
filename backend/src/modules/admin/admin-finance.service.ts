import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceQueryDto } from './dto';

@Injectable()
export class AdminFinanceService {
  private readonly logger = new Logger(AdminFinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getFinanceSummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevenue, monthlyRevenue, lastMonthRevenue, orderCount, paidOrderCount] =
      await Promise.all([
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS', paidAt: { gte: monthStart } },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS', paidAt: { gte: lastMonthStart, lt: lastMonthEnd } },
          _sum: { amount: true },
        }),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: { notIn: ['PENDING', 'CANCELLED'] } } }),
      ]);

    const total = Number(totalRevenue._sum.amount ?? 0);
    const monthly = Number(monthlyRevenue._sum.amount ?? 0);
    const lastMonthly = Number(lastMonthRevenue._sum.amount ?? 0);
    const monthGrowth = lastMonthly > 0 ? ((monthly - lastMonthly) / lastMonthly) * 100 : 0;

    return {
      totalRevenue: total,
      monthlyRevenue: monthly,
      monthGrowth: Math.round(monthGrowth * 100) / 100,
      orderCount,
      paidOrderCount,
      averageOrderValue: paidOrderCount > 0 ? Math.round((total / paidOrderCount) * 100) / 100 : 0,
    };
  }

  async getTransactions(query: FinanceQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      status: 'SUCCESS',
    };

    if (query.startDate || query.endDate) {
      const paidAt: Record<string, Date> = {};
      if (query.startDate) paidAt.gte = new Date(query.startDate);
      if (query.endDate) paidAt.lte = new Date(query.endDate);
      where.paidAt = paidAt;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { paidAt: 'desc' },
        include: {
          order: {
            include: {
              user: { select: { id: true, nickname: true, email: true } },
              items: { select: { productName: true, quantity: true, price: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: transactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getMerchantSettlements() {
    // Aggregate revenue by merchant
    const merchants = await this.prisma.$queryRaw<
      Array<{
        merchantId: string;
        nickname: string;
        email: string;
        totalAmount: string;
        orderCount: bigint;
      }>
    >`
      SELECT
        p."merchant_id" as "merchantId",
        u.nickname,
        u.email,
        COALESCE(SUM(oi.price * oi.quantity), 0)::text as "totalAmount",
        COUNT(DISTINCT o.id) as "orderCount"
      FROM products p
      JOIN users u ON p."merchant_id" = u.id
      JOIN order_items oi ON oi."product_id" = p.id
      JOIN orders o ON oi."order_id" = o.id AND o.status NOT IN ('PENDING', 'CANCELLED')
      WHERE p."deleted_at" IS NULL
      GROUP BY p."merchant_id", u.nickname, u.email
      ORDER BY "totalAmount" DESC
    `;

    return merchants.map((m) => ({
      ...m,
      totalAmount: Number(m.totalAmount),
      orderCount: Number(m.orderCount),
    }));
  }
}
