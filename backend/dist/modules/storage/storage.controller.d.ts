import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadImage(file: Express.Multer.File, type: string): Promise<{
        url: string;
        thumbnailUrl?: string;
    }>;
    uploadVideo(file: Express.Multer.File): Promise<{
        url: string;
        duration: number;
    }>;
}
