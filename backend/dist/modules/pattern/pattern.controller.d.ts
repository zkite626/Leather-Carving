import { PatternService } from './pattern.service';
import { CreatePatternDto, UpdatePatternDto, QueryPatternDto } from './dto/pattern.dto';
export declare class PatternController {
    private readonly patternService;
    constructor(patternService: PatternService);
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
