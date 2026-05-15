export declare class CreateArtworkDto {
    title: string;
    description?: string;
    category?: string;
    techniques?: string[];
    materials?: string[];
    tags?: string[];
    story?: string;
}
export declare class UpdateArtworkDto {
    title?: string;
    description?: string;
    category?: string;
    techniques?: string[];
    materials?: string[];
    tags?: string[];
    story?: string;
}
export declare class QueryArtworkDto {
    page?: number;
    pageSize?: number;
    category?: string;
    keyword?: string;
    techniques?: string;
    sortBy?: 'createdAt' | 'likeCount' | 'viewCount';
}
