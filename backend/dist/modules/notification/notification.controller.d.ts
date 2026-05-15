import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAll(userId: string, page?: number, pageSize?: number, isRead?: string): Promise<{
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
    getUnreadCount(userId: string): Promise<{
        count: number;
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
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
