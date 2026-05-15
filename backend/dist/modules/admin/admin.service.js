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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const DASHBOARD_CACHE_KEY = 'admin:dashboard';
const DASHBOARD_CACHE_TTL = 300;
const TREND_CACHE_KEY = 'admin:trend';
let AdminService = AdminService_1 = class AdminService {
    prisma;
    redis;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getDashboard(query) {
        const period = query.period ?? 'day';
        const cacheKey = `${DASHBOARD_CACHE_KEY}:${period}`;
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached)
                return JSON.parse(cached);
        }
        catch {
        }
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [userCount, courseCount, orderCount, revenueResult, todayNewUsers, todayOrders, todayRevenue,] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.course.count({ where: { deletedAt: null } }),
            this.prisma.order.count(),
            this.prisma.payment.aggregate({
                where: { status: 'SUCCESS' },
                _sum: { amount: true },
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: todayStart }, deletedAt: null },
            }),
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
        }
        catch {
        }
        return data;
    }
    async getUserGrowthChart(period) {
        const points = period === 'month' ? 30 : period === 'week' ? 7 : 24;
        const results = [];
        for (let i = points - 1; i >= 0; i--) {
            const start = new Date();
            const end = new Date();
            if (period === 'month') {
                start.setDate(start.getDate() - i - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - i);
                end.setHours(0, 0, 0, 0);
            }
            else if (period === 'week') {
                start.setDate(start.getDate() - i - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - i);
                end.setHours(0, 0, 0, 0);
            }
            else {
                start.setHours(start.getHours() - i - 1, 0, 0, 0);
                end.setHours(end.getHours() - i, 0, 0, 0);
            }
            const count = await this.prisma.user.count({
                where: { createdAt: { gte: start, lt: end }, deletedAt: null },
            });
            const label = period === 'day'
                ? `${start.getHours().toString().padStart(2, '0')}:00`
                : `${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
            results.push({ date: label, count });
        }
        return results;
    }
    async getRevenueChart(period) {
        const points = period === 'month' ? 30 : period === 'week' ? 7 : 24;
        const results = [];
        for (let i = points - 1; i >= 0; i--) {
            const start = new Date();
            const end = new Date();
            if (period === 'month') {
                start.setDate(start.getDate() - i - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - i);
                end.setHours(0, 0, 0, 0);
            }
            else if (period === 'week') {
                start.setDate(start.getDate() - i - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - i);
                end.setHours(0, 0, 0, 0);
            }
            else {
                start.setHours(start.getHours() - i - 1, 0, 0, 0);
                end.setHours(end.getHours() - i, 0, 0, 0);
            }
            const result = await this.prisma.payment.aggregate({
                where: { status: 'SUCCESS', paidAt: { gte: start, lt: end } },
                _sum: { amount: true },
            });
            const label = period === 'day'
                ? `${start.getHours().toString().padStart(2, '0')}:00`
                : `${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
            results.push({ date: label, amount: Number(result._sum.amount ?? 0) });
        }
        return results;
    }
    async getTopCourses() {
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
    async precomputeDailyStats() {
        this.logger.log('Precomputing daily dashboard stats...');
        try {
            await this.redis.del(DASHBOARD_CACHE_KEY);
            await this.redis.del(TREND_CACHE_KEY);
            for (const period of ['day', 'week', 'month']) {
                await this.getDashboard({ period });
            }
            this.logger.log('Daily stats precomputation complete');
        }
        catch (error) {
            this.logger.error('Failed to precompute daily stats', error);
        }
    }
};
exports.AdminService = AdminService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminService.prototype, "precomputeDailyStats", null);
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AdminService);
//# sourceMappingURL=admin.service.js.map