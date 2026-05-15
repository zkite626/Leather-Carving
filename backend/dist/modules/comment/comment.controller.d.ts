import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    getArtworkComments(artworkId: string, page?: number, pageSize?: number): Promise<{
        data: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
            replies: ({
                user: {
                    id: string;
                    nickname: string;
                    avatar: string | null;
                    role: import("@prisma/client").$Enums.UserRole;
                };
                replies: ({
                    user: {
                        id: string;
                        nickname: string;
                        avatar: string | null;
                        role: import("@prisma/client").$Enums.UserRole;
                    };
                } & {
                    id: string;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    parentId: string | null;
                    content: string;
                    likeCount: number;
                    artworkId: string | null;
                    postId: string | null;
                })[];
            } & {
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                parentId: string | null;
                content: string;
                likeCount: number;
                artworkId: string | null;
                postId: string | null;
            })[];
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            parentId: string | null;
            content: string;
            likeCount: number;
            artworkId: string | null;
            postId: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    commentOnArtwork(artworkId: string, userId: string, dto: CreateCommentDto): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        parentId: string | null;
        content: string;
        likeCount: number;
        artworkId: string | null;
        postId: string | null;
    }>;
    getPostComments(postId: string, page?: number, pageSize?: number): Promise<{
        data: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
            replies: ({
                user: {
                    id: string;
                    nickname: string;
                    avatar: string | null;
                    role: import("@prisma/client").$Enums.UserRole;
                };
                replies: ({
                    user: {
                        id: string;
                        nickname: string;
                        avatar: string | null;
                        role: import("@prisma/client").$Enums.UserRole;
                    };
                } & {
                    id: string;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    parentId: string | null;
                    content: string;
                    likeCount: number;
                    artworkId: string | null;
                    postId: string | null;
                })[];
            } & {
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                parentId: string | null;
                content: string;
                likeCount: number;
                artworkId: string | null;
                postId: string | null;
            })[];
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            parentId: string | null;
            content: string;
            likeCount: number;
            artworkId: string | null;
            postId: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    commentOnPost(postId: string, userId: string, dto: CreateCommentDto): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        parentId: string | null;
        content: string;
        likeCount: number;
        artworkId: string | null;
        postId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
