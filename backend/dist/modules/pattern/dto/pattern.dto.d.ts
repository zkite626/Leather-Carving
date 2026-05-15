export declare class CreatePatternDto {
    name: string;
    category?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    description?: string;
    origin?: string;
    tags?: string[];
}
export declare class UpdatePatternDto {
    name?: string;
    category?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    description?: string;
    origin?: string;
    tags?: string[];
}
export declare class QueryPatternDto {
    page?: number;
    pageSize?: number;
    category?: string;
    keyword?: string;
}
