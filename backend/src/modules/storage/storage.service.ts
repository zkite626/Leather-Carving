import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 500 * 1024 * 1024; // 500MB

const BUCKET_MAP: Record<string, string> = {
  avatar: 'avatars',
  course: 'courses',
  video: 'videos',
  artwork: 'artworks',
  product: 'products',
  post: 'community',
  pattern: 'patterns',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client | null = null;
  private useLocalStorage = false;
  private readonly localUploadDir: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.publicUrl = this.config.get(
      'MINIO_PUBLIC_URL',
      'http://localhost:9000',
    );

    this.localUploadDir = path.resolve(
      process.cwd(),
      this.config.get('LOCAL_UPLOAD_DIR', 'uploads'),
    );

    const minioEndpoint = this.config.get<string>('MINIO_ENDPOINT');
    if (!minioEndpoint) {
      this.logger.warn(
        'MINIO_ENDPOINT not set — using local filesystem storage',
      );
      this.useLocalStorage = true;
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
      return;
    }

    try {
      this.minioClient = new Minio.Client({
        endPoint: minioEndpoint,
        port: parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10),
        useSSL: this.config.get('MINIO_USE_SSL', 'false') === 'true',
        accessKey: this.config.get('MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: this.config.get('MINIO_SECRET_KEY', 'minioadmin'),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `MinIO init failed: ${message} — falling back to local storage`,
      );
      this.useLocalStorage = true;
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    type: string,
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid image type. Allowed: jpg, png, webp, gif',
      );
    }

    if (file.size > IMAGE_MAX_SIZE) {
      throw new BadRequestException('Image size exceeds 10MB limit');
    }

    const bucket = BUCKET_MAP[type] ?? 'courses';
    const ext = path.extname(file.originalname) || '.webp';
    const objectName = `${type}/${uuidv4()}${ext}`;

    if (this.useLocalStorage) {
      return this.saveToLocal(file, bucket, objectName);
    }

    await this.ensureBucket(bucket);
    await this.minioClient!.putObject(
      bucket,
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = `${this.publicUrl}/${bucket}/${objectName}`;
    this.logger.log(`Image uploaded to MinIO: ${url}`);

    return { url };
  }

  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<{ url: string; duration: number }> {
    if (!VIDEO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid video type. Allowed: mp4, mov');
    }

    if (file.size > VIDEO_MAX_SIZE) {
      throw new BadRequestException('Video size exceeds 500MB limit');
    }

    const bucket = 'videos';
    const ext = path.extname(file.originalname) || '.mp4';
    const objectName = `lessons/${uuidv4()}${ext}`;

    if (this.useLocalStorage) {
      const result = this.saveToLocal(file, bucket, objectName);
      return { url: result.url, duration: 0 };
    }

    await this.ensureBucket(bucket);
    await this.minioClient!.putObject(
      bucket,
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = `${this.publicUrl}/${bucket}/${objectName}`;
    this.logger.log(`Video uploaded to MinIO: ${url}`);

    return { url, duration: 0 };
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    if (this.useLocalStorage) {
      const filePath = path.join(this.localUploadDir, bucket, objectName);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.log(`Local file deleted: ${filePath}`);
        }
      } catch (error) {
        this.logger.error(`Failed to delete local file: ${filePath}`, error);
      }
      return;
    }

    try {
      await this.minioClient!.removeObject(bucket, objectName);
      this.logger.log(`File deleted from MinIO: ${bucket}/${objectName}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file: ${bucket}/${objectName}`,
        error,
      );
    }
  }

  getPresignedUrl(
    bucket: string,
    objectName: string,
    expiry = 3600,
  ): Promise<string> {
    if (this.useLocalStorage || !this.minioClient) {
      // For local storage, return a direct URL
      return Promise.resolve(`/uploads/${bucket}/${objectName}`);
    }
    return this.minioClient.presignedGetObject(bucket, objectName, expiry);
  }

  private saveToLocal(
    file: Express.Multer.File,
    bucket: string,
    objectName: string,
  ): { url: string } {
    const dir = path.join(this.localUploadDir, bucket);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(
      this.localUploadDir,
      bucket,
      path.basename(objectName),
    );
    fs.writeFileSync(filePath, file.buffer);

    const url = `/uploads/${bucket}/${path.basename(objectName)}`;
    this.logger.log(`Image saved locally: ${url}`);

    return { url };
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.minioClient!.bucketExists(bucket);
    if (!exists) {
      await this.minioClient!.makeBucket(bucket);
      this.logger.log(`Bucket created: ${bucket}`);
    }
  }
}
