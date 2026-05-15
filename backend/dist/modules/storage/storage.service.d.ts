import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private readonly config;
    private readonly logger;
    private minioClient;
    private useLocalStorage;
    private readonly localUploadDir;
    private readonly publicUrl;
    constructor(config: ConfigService);
    uploadImage(file: Express.Multer.File, type: string): Promise<{
        url: string;
        thumbnailUrl?: string;
    }>;
    uploadVideo(file: Express.Multer.File): Promise<{
        url: string;
        duration: number;
    }>;
    deleteFile(bucket: string, objectName: string): Promise<void>;
    getPresignedUrl(bucket: string, objectName: string, expiry?: number): Promise<string>;
    private saveToLocal;
    private ensureBucket;
}
