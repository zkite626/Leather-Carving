import { CommunityService } from './community.service';
import { CreatePostDto, PostType } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class CommunityController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    findAll(page?: number, pageSize?: number, type?: PostType, keyword?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: {
            id: string;
            type: import("@prisma/client").$Enums.PostType;
            title: string;
            content: string;
            images: string[];
            tags: string[];
            viewCount: number;
            likeCount: number;
            commentCount: number;
            isPinned: boolean;
            status: import("@prisma/client").$Enums.PostStatus;
            createdAt: Date;
            author: {
                id: string;
                nickname: string;
                avatar: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getHotTopics(): Promise<{
        id: string;
        title: string;
        type: import("@prisma/client").$Enums.PostType;
        likeCount: number;
        viewCount: number;
        commentCount: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.PostType;
        title: string;
        content: string;
        images: string[];
        tags: string[];
        viewCount: number;
        likeCount: number;
        commentCount: number;
        isPinned: boolean;
        status: import("@prisma/client").$Enums.PostStatus;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    create(userId: string, dto: CreatePostDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.PostType;
        title: string;
        content: string;
        images: string[];
        tags: string[];
        viewCount: number;
        likeCount: number;
        commentCount: number;
        isPinned: boolean;
        status: import("@prisma/client").$Enums.PostStatus;
        createdAt: Date;
        author: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    update(id: string, userId: string, dto: UpdatePostDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.PostType;
        title: string;
        content: string;
        images: string[];
        tags: string[];
        viewCount: number;
        likeCount: number;
        commentCount: number;
        isPinned: boolean;
        status: import("@prisma/client").$Enums.PostStatus;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    getCheckinStatus(id: string, userId: string): Promise<{
        totalCheckins: number;
        consecutiveDays: number;
        lastCheckin: Date;
    }>;
    checkin(id: string, userId: string): Promise<{
        message: string;
        checkedIn: boolean;
    }>;
}
