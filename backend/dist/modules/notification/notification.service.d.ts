import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string, params: {
        page?: number;
        pageSize?: number;
        isRead?: boolean;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            link: string | null;
            userId: string;
            title: string;
            type: string;
            content: string;
            isRead: boolean;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<number>;
    create(data: {
        userId: string;
        type: string;
        title: string;
        content: string;
        link?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        type: string;
        content: string;
        isRead: boolean;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        type: string;
        content: string;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
