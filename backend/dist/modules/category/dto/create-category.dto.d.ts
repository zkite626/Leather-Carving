export declare class CreateCategoryDto {
    name: string;
    slug: string;
    icon?: string;
    parentId?: string;
    sortOrder?: number;
}
export declare class UpdateCategoryDto {
    name?: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    sortOrder?: number;
}
