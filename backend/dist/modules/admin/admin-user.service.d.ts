import { PrismaService } from '../prisma/prisma.service';
import { UserQueryDto, UpdateUserRoleDto, UpdateUserStatusDto, CreateUserDto, UpdateUserDto } from './dto';
export declare class AdminUserService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    getUserById(id: string): Promise<{
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
        createdAt: Date;
        _count: {
            enrollments: number;
            artworks: number;
            products: number;
            orders: number;
        };
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        avatar: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getUsers(query: UserQueryDto): Promise<{
        items: {
            id: string;
            email: string;
            phone: string | null;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            _count: {
                enrollments: number;
                artworks: number;
                orders: number;
            };
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<{
        id: string;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateUserStatus(userId: string, dto: UpdateUserStatusDto): Promise<{
        id: string;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
}
