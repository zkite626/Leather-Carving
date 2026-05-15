import { ArtworkService } from './artwork.service';
import { CreateArtworkDto, UpdateArtworkDto, QueryArtworkDto } from './dto/create-artwork.dto';
export declare class ArtworkController {
    private readonly artworkService;
    constructor(artworkService: ArtworkService);
    findAll(query: QueryArtworkDto): Promise<{
        data: ({
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                url: string;
                artworkId: string;
                caption: string | null;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ArtworkStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            description: string | null;
            coverImage: string | null;
            tags: string[];
            category: string | null;
            techniques: string[];
            materials: string[];
            story: string | null;
            likeCount: number;
            viewCount: number;
            is3D: boolean;
            modelUrl: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findMy(userId: string, query: QueryArtworkDto): Promise<{
        data: ({
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                url: string;
                artworkId: string;
                caption: string | null;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ArtworkStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            description: string | null;
            coverImage: string | null;
            tags: string[];
            category: string | null;
            techniques: string[];
            materials: string[];
            story: string | null;
            likeCount: number;
            viewCount: number;
            is3D: boolean;
            modelUrl: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        comments: ({
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
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            url: string;
            artworkId: string;
            caption: string | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    }>;
    getRelated(id: string): Promise<({
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            url: string;
            artworkId: string;
            caption: string | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    })[]>;
    create(userId: string, dto: CreateArtworkDto): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            url: string;
            artworkId: string;
            caption: string | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    }>;
    addImages(id: string, userId: string, body: {
        imageUrls: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        url: string;
        artworkId: string;
        caption: string | null;
    }[]>;
    reorderImages(id: string, userId: string, body: {
        imageIds: string[];
    }): Promise<void>;
    setCover(id: string, imageId: string, userId: string): Promise<{
        message: string;
    }>;
    deleteImage(id: string, imageId: string, userId: string): Promise<void>;
    submitForReview(id: string, userId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateArtworkDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
