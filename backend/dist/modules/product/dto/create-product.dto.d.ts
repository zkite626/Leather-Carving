export declare class CreateProductDto {
    name: string;
    slug?: string;
    description?: string;
    categoryId: string;
    price: number;
    originalPrice?: number;
    stock?: number;
    stockAlert?: number;
    isGuangxi?: boolean;
    attributes?: Record<string, unknown>;
    tags?: string[];
}
export declare class UpdateProductDto {
    name?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
    price?: number;
    originalPrice?: number;
    stock?: number;
    stockAlert?: number;
    isGuangxi?: boolean;
    attributes?: Record<string, unknown>;
    tags?: string[];
}
export declare class QueryProductDto {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    isGuangxi?: boolean;
    minPrice?: number;
    maxPrice?: number;
    keyword?: string;
    sortBy?: 'createdAt' | 'sales' | 'price' | 'rating';
    sortOrder?: 'asc' | 'desc';
    status?: string;
}
export declare class AddProductImagesDto {
    imageUrls: string[];
}
