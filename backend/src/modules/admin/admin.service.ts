import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DashboardQueryDto } from './dto';
import { Prisma } from '@prisma/client';

const DASHBOARD_CACHE_KEY = 'admin:dashboard';
const DASHBOARD_CACHE_TTL = 300; // 5 minutes
const TREND_CACHE_KEY = 'admin:trend';
const TREND_CACHE_TTL = 3600; // 1 hour

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getDashboard(query: DashboardQueryDto) {
    const period = query.period ?? 'day';
    const cacheKey = `${DASHBOARD_CACHE_KEY}:${period}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis unavailable
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [userCount, courseCount, orderCount, revenueResult, todayNewUsers, todayOrders, todayRevenue] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.course.count({ where: { deletedAt: null } }),
        this.prisma.order.count(),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        this.prisma.user.count({ where: { createdAt: { gte: todayStart }, deletedAt: null } }),
        this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS', paidAt: { gte: todayStart } },
          _sum: { amount: true },
        }),
      ]);

    const [userGrowthChart, revenueChart, topCourses] = await Promise.all([
      this.getUserGrowthChart(period),
      this.getRevenueChart(period),
      this.getTopCourses(),
    ]);

    const data = {
      userCount,
      courseCount,
      orderCount,
      revenue: Number(revenueResult._sum.amount ?? 0),
      todayNewUsers,
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
      userGrowthChart,
      revenueChart,
      topCourses,
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(data), DASHBOARD_CACHE_TTL);
    } catch {
      // Redis unavailable
    }

    return data;
  }

  private async getUserGrowthChart(period: string) {
    const days = period === 'month' ? 30 : period === 'week' ? 7 : 1;
    const points = period === 'month' ? 30 : period === 'week' ? 7 : 24;
    const results: Array<{ date: string; count: number }> = [];

    for (let i = points - 1; i >= 0; i--) {
      const start = new Date();
      const end = new Date();

      if (period === 'month') {
        start.setDate(start.getDate() - i - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - i);
        end.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        start.setDate(start.getDate() - i - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - i);
        end.setHours(0, 0, 0, 0);
      } else {
        start.setHours(start.getHours() - i - 1, 0, 0, 0);
        end.setHours(end.getHours() - i, 0, 0, 0);
      }

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: start, lt: end }, deletedAt: null },
      });

      const label =
        period === 'day'
          ? `${start.getHours().toString().padStart(2, '0')}:00`
          : `${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;

      results.push({ date: label, count });
    }

    return results;
  }

  private async getRevenueChart(period: string) {
    const points = period === 'month' ? 30 : period === 'week' ? 7 : 24;
    const results: Array<{ date: string; amount: number }> = [];

    for (let i = points - 1; i >= 0; i--) {
      const start = new Date();
      const end = new Date();

      if (period === 'month') {
        start.setDate(start.getDate() - i - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - i);
        end.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        start.setDate(start.getDate() - i - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - i);
        end.setHours(0, 0, 0, 0);
      } else {
        start.setHours(start.getHours() - i - 1, 0, 0, 0);
        end.setHours(end.getHours() - i, 0, 0, 0);
      }

      const result = await this.prisma.payment.aggregate({
        where: { status: 'SUCCESS', paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      });

      const label =
        period === 'day'
          ? `${start.getHours().toString().padStart(2, '0')}:00`
          : `${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;

      results.push({ date: label, amount: Number(result._sum.amount ?? 0) });
    }

    return results;
  }

  private async getTopCourses() {
    return this.prisma.course.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      orderBy: { enrollCount: 'desc' },
      take: 10,
      select: { id: true, title: true, enrollCount: true, coverImage: true },
    });
  }

  async getRecentActivities() {
    const activities = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    return activities;
  }

  // Precompute daily stats at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async precomputeDailyStats() {
    this.logger.log('Precomputing daily dashboard stats...');
    try {
      // Invalidate cache so next request gets fresh data
      await this.redis.del(DASHBOARD_CACHE_KEY);
      await this.redis.del(TREND_CACHE_KEY);

      // Warm the cache for all periods
      for (const period of ['day', 'week', 'month']) {
        await this.getDashboard({ period });
      }

      this.logger.log('Daily stats precomputation complete');
    } catch (error: unknown) {
      this.logger.error('Failed to precompute daily stats', error);
    }
  }
}
