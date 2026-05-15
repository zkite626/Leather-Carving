import { UserRole, UserStatus } from '@prisma/client';
export declare class UpdateUserRoleDto {
    role: UserRole;
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
    reason?: string;
}
export declare class ApproveContentDto {
    comment?: string;
}
export declare class RejectContentDto {
    reason: string;
}
export declare class UpdateOrderStatusDto {
    status: string;
    trackingNo?: string;
}
export declare class BatchContentActionDto {
    ids: string[];
    reason?: string;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    nickname: string;
    role?: UserRole;
    phone?: string;
}
export declare class UpdateUserDto {
    nickname?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
}
