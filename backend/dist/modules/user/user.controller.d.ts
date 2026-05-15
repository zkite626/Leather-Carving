import { UserService } from './user.service';
declare class UpdateProfileDto {
    nickname?: string;
    avatar?: string;
    bio?: string;
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        avatar: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateMe(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        avatar: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
