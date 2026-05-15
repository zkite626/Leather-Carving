"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = __importStar(require("minio"));
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const VIDEO_MAX_SIZE = 500 * 1024 * 1024;
const BUCKET_MAP = {
    avatar: 'avatars',
    course: 'courses',
    video: 'videos',
    artwork: 'artworks',
    product: 'products',
    post: 'community',
    pattern: 'patterns',
};
let StorageService = StorageService_1 = class StorageService {
    config;
    logger = new common_1.Logger(StorageService_1.name);
    minioClient = null;
    useLocalStorage = false;
    localUploadDir;
    publicUrl;
    constructor(config) {
        this.config = config;
        this.publicUrl = this.config.get('MINIO_PUBLIC_URL', 'http://localhost:9000');
        this.localUploadDir = path.resolve(process.cwd(), this.config.get('LOCAL_UPLOAD_DIR', 'uploads'));
        const minioEndpoint = this.config.get('MINIO_ENDPOINT');
        if (!minioEndpoint) {
            this.logger.warn('MINIO_ENDPOINT not set — using local filesystem storage');
            this.useLocalStorage = true;
            if (!fs.existsSync(this.localUploadDir)) {
                fs.mkdirSync(this.localUploadDir, { recursive: true });
            }
            return;
        }
        try {
            this.minioClient = new Minio.Client({
                endPoint: minioEndpoint,
                port: parseInt(this.config.get('MINIO_PORT', '9000'), 10),
                useSSL: this.config.get('MINIO_USE_SSL', 'false') === 'true',
                accessKey: this.config.get('MINIO_ACCESS_KEY', 'minioadmin'),
                secretKey: this.config.get('MINIO_SECRET_KEY', 'minioadmin'),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`MinIO init failed: ${message} — falling back to local storage`);
            this.useLocalStorage = true;
            if (!fs.existsSync(this.localUploadDir)) {
                fs.mkdirSync(this.localUploadDir, { recursive: true });
            }
        }
    }
    async uploadImage(file, type) {
        if (!IMAGE_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid image type. Allowed: jpg, png, webp, gif');
        }
        if (file.size > IMAGE_MAX_SIZE) {
            throw new common_1.BadRequestException('Image size exceeds 10MB limit');
        }
        const bucket = BUCKET_MAP[type] ?? 'courses';
        const ext = path.extname(file.originalname) || '.webp';
        const objectName = `${type}/${(0, uuid_1.v4)()}${ext}`;
        if (this.useLocalStorage) {
            return this.saveToLocal(file, bucket, objectName);
        }
        await this.ensureBucket(bucket);
        await this.minioClient.putObject(bucket, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });
        const url = `${this.publicUrl}/${bucket}/${objectName}`;
        this.logger.log(`Image uploaded to MinIO: ${url}`);
        return { url };
    }
    async uploadVideo(file) {
        if (!VIDEO_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid video type. Allowed: mp4, mov');
        }
        if (file.size > VIDEO_MAX_SIZE) {
            throw new common_1.BadRequestException('Video size exceeds 500MB limit');
        }
        const bucket = 'videos';
        const ext = path.extname(file.originalname) || '.mp4';
        const objectName = `lessons/${(0, uuid_1.v4)()}${ext}`;
        if (this.useLocalStorage) {
            const result = this.saveToLocal(file, bucket, objectName);
            return { url: result.url, duration: 0 };
        }
        await this.ensureBucket(bucket);
        await this.minioClient.putObject(bucket, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });
        const url = `${this.publicUrl}/${bucket}/${objectName}`;
        this.logger.log(`Video uploaded to MinIO: ${url}`);
        return { url, duration: 0 };
    }
    async deleteFile(bucket, objectName) {
        if (this.useLocalStorage) {
            const filePath = path.join(this.localUploadDir, bucket, objectName);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    this.logger.log(`Local file deleted: ${filePath}`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to delete local file: ${filePath}`, error);
            }
            return;
        }
        try {
            await this.minioClient.removeObject(bucket, objectName);
            this.logger.log(`File deleted from MinIO: ${bucket}/${objectName}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${bucket}/${objectName}`, error);
        }
    }
    getPresignedUrl(bucket, objectName, expiry = 3600) {
        if (this.useLocalStorage || !this.minioClient) {
            return Promise.resolve(`/uploads/${bucket}/${objectName}`);
        }
        return this.minioClient.presignedGetObject(bucket, objectName, expiry);
    }
    saveToLocal(file, bucket, objectName) {
        const dir = path.join(this.localUploadDir, bucket);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(this.localUploadDir, bucket, path.basename(objectName));
        fs.writeFileSync(filePath, file.buffer);
        const url = `/uploads/${bucket}/${path.basename(objectName)}`;
        this.logger.log(`Image saved locally: ${url}`);
        return { url };
    }
    async ensureBucket(bucket) {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
            await this.minioClient.makeBucket(bucket);
            this.logger.log(`Bucket created: ${bucket}`);
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map