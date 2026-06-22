import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT'),
      port: parseInt(this.config.get('MINIO_PORT')),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY'),
      secretKey: this.config.get('MINIO_SECRET_KEY'),
    });
    this.bucket = this.config.get('MINIO_BUCKET');
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket "${this.bucket}" created`);
      } else {
        this.logger.log(`Bucket "${this.bucket}" already exists`);
      }
      // Set public policy
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      });
      await this.client.setBucketPolicy(this.bucket, policy);
    } catch (error) {
      this.logger.error('MinIO bucket error:', error);
    }
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    mimeType: string,
    size?: number,
  ): Promise<string> {
    await this.client.putObject(
      this.bucket,
      key,
      buffer,
      size ?? buffer.length,
      {
        'Content-Type': mimeType,
      },
    );
    return this.getPublicUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }

  async getPresignedUrl(key: string, expiry: number = 900): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expiry);
  }

  getPublicUrl(key: string): string {
    const endpoint = this.config.get('MINIO_ENDPOINT');
    const port = this.config.get('MINIO_PORT');
    const ssl = this.config.get('MINIO_USE_SSL') === 'true';
    const protocol = ssl ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucket}/${key}`;
  }

  getBucket(): string {
    return this.bucket;
  }
}
