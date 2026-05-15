import { UserRole, UserStatus, OrderStatus } from '@prisma/client';
export declare class AdminPaginationDto {
    page?: number;
    pageSize?: number;
}
export declare class UserQueryDto extends AdminPaginationDto {
    keyword?: string;
    role?: UserRole;
    status?: UserStatus;
}
export declare class OrderQueryDto extends AdminPaginationDto {
    status?: OrderStatus;
    keyword?: string;
}
export declare class ContentReviewQueryDto extends AdminPaginationDto {
    status?: string;
    type?: string;
}
export declare class AuditLogQueryDto extends AdminPaginationDto {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class FinanceQueryDto extends AdminPaginationDto {
    startDate?: string;
    endDate?: string;
}
export declare class DashboardQueryDto {
    period?: string;
}
export declare class CourseQueryDto extends AdminPaginationDto {
    keyword?: string;
    status?: string;
    level?: string;
}
export declare class ProductQueryDto extends AdminPaginationDto {
    keyword?: string;
    status?: string;
}
