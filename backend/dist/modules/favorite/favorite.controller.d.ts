import { FavoriteService } from './favorite.service';
export declare class FavoriteController {
    private readonly favoriteService;
    constructor(favoriteService: FavoriteService);
    toggle(userId: string, entityType: string, entityId: string): Promise<{
        favorited: boolean;
    }>;
    check(userId: string, entityType: string, entityId: string): Promise<{
        favorited: boolean;
    }>;
    getMyFavorites(userId: string, entityType?: string, page?: number, pageSize?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            entityType: string;
            entityId: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
}
