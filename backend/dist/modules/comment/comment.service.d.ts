import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private validateEntity;
    private checkDepth;
    create(userId: string, entityType: 'artwork' | 'post', entityId: string, dto: CreateCommentDto): Promise<{
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
    findByEntity(entityType: 'artwork' | 'post', entityId: string, page?: number, pageSize?: number): Promise<{
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
    remove(commentId: string, userId: string): Promise<void>;
}
