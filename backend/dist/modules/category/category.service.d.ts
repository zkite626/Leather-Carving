import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
export declare class CategoryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    private isDescendant;
}
