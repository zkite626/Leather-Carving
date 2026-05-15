import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/create-banner.dto';
export declare class BannerController {
    private readonly bannerService;
    constructor(bannerService: BannerService);
    findAll(position?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        title: string;
        sortOrder: number;
        image: string;
        position: string;
        isActive: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }[]>;
    findAllAdmin(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        title: string;
        sortOrder: number;
        image: string;
        position: string;
        isActive: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        title: string;
        sortOrder: number;
        image: string;
        position: string;
        isActive: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }>;
    create(dto: CreateBannerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        title: string;
        sortOrder: number;
        image: string;
        position: string;
        isActive: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }>;
    update(id: string, dto: UpdateBannerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        title: string;
        sortOrder: number;
        image: string;
        position: string;
        isActive: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
