import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DashboardQueryDto } from './dto';
export declare class AdminService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    getDashboard(query: DashboardQueryDto): Promise<Record<string, unknown> | {
        userCount: number;
        courseCount: number;
        orderCount: number;
        revenue: number;
        todayNewUsers: number;
        todayOrders: number;
        todayRevenue: number;
        userGrowthChart: {
            date: string;
            count: number;
        }[];
        revenueChart: {
            date: string;
            amount: number;
        }[];
        topCourses: {
            id: string;
            title: string;
            coverImage: string | null;
            enrollCount: number;
        }[];
    }>;
    private getUserGrowthChart;
    private getRevenueChart;
    private getTopCourses;
    getRecentActivities(): Promise<({
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        entityType: string;
        entityId: string | null;
        action: string;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ip: string | null;
        userAgent: string | null;
    })[]>;
    precomputeDailyStats(): Promise<void>;
}
