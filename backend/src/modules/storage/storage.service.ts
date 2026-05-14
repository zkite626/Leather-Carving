import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

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
  private readonly minioClient: Minio.Client;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get('MINIO_PORT', '9000'), 10),
      useSSL: this.config.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'minioadmin'),
    });

    this.publicUrl = this.config.get(
      'MINIO_PUBLIC_URL',
      'http://localhost:9000',
    );
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

    await this.ensureBucket(bucket);
    await this.minioClient.putObject(bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = `${this.publicUrl}/${bucket}/${objectName}`;
    this.logger.log(`Image uploaded: ${url}`);

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

    await this.ensureBucket(bucket);
    await this.minioClient.putObject(bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = `${this.publicUrl}/${bucket}/${objectName}`;
    this.logger.log(`Video uploaded: ${url}`);

    // Duration extraction would require FFmpeg in production
    return { url, duration: 0 };
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, objectName);
      this.logger.log(`File deleted: ${bucket}/${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${bucket}/${objectName}`, error);
    }
  }

  getPresignedUrl(bucket: string, objectName: string, expiry = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(bucket, objectName, expiry);
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucket);
    if (!exists) {
      await this.minioClient.makeBucket(bucket);
      this.logger.log(`Bucket created: ${bucket}`);
    }
  }
}
