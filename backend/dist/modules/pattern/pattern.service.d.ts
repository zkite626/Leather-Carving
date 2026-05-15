import { PrismaService } from '../prisma/prisma.service';
import { CreatePatternDto, UpdatePatternDto, QueryPatternDto } from './dto/pattern.dto';
export declare class PatternService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreatePatternDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tags: string[];
        category: string | null;
        thumbnailUrl: string | null;
        imageUrl: string;
        origin: string | null;
        downloadCount: number;
    }>;
    findAll(query: QueryPatternDto): Promise<{
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            tags: string[];
            category: string | null;
            thumbnailUrl: string | null;
            imageUrl: string;
            origin: string | null;
            downloadCount: number;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tags: string[];
        category: string | null;
        thumbnailUrl: string | null;
        imageUrl: string;
        origin: string | null;
        downloadCount: number;
    }>;
    update(id: string, dto: UpdatePatternDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tags: string[];
        category: string | null;
        thumbnailUrl: string | null;
        imageUrl: string;
        origin: string | null;
        downloadCount: number;
    }>;
    remove(id: string): Promise<void>;
    incrementDownload(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tags: string[];
        category: string | null;
        thumbnailUrl: string | null;
        imageUrl: string;
        origin: string | null;
        downloadCount: number;
    }>;
}
