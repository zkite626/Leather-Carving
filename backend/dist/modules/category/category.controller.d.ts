import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(): Promise<({
        children: ({
            children: ({
                _count: {
                    products: number;
                };
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                parentId: string | null;
                icon: string | null;
                sortOrder: number;
            })[];
            _count: {
                products: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        })[];
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        parentId: string | null;
        icon: string | null;
        sortOrder: number;
    })[]>;
    findOne(id: string): Promise<{
        children: ({
            _count: {
                products: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            parentId: string | null;
            icon: string | null;
            sortOrder: number;
        })[];
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        parentId: string | null;
        icon: string | null;
        sortOrder: number;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        parentId: string | null;
        icon: string | null;
        sortOrder: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        parentId: string | null;
        icon: string | null;
        sortOrder: number;
    }>;
    remove(id: string): Promise<void>;
}
