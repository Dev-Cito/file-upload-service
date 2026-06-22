import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { File, FileType } from './entities/file.entity';
import { MinioService } from '../minio/minio.service';
import { SupabaseStorageService } from '../minio/supabase-storage.service';
import { User } from '../users/entities/user.entity';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';


const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DOC_SIZE = 50 * 1024 * 1024;

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private useSupabase: boolean;

  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    private minioService: MinioService,
    private supabaseService: SupabaseStorageService,
    private config: ConfigService,
  ) {
    this.useSupabase = this.config.get('STORAGE_PROVIDER') === 'supabase';
    this.logger.log(
      `Storage provider: ${this.useSupabase ? 'Supabase' : 'MinIO'}`,
    );
  }

  private get storage() {
    return this.useSupabase ? this.supabaseService : this.minioService;
  }

  private getFileType(mimeType: string): FileType {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return FileType.IMAGE;
    if (ALLOWED_DOC_TYPES.includes(mimeType)) return FileType.DOCUMENT;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    return FileType.OTHER;
  }

  private validateFile(mimeType: string, size: number) {
    const fileType = this.getFileType(mimeType);
    const isImage = fileType === FileType.IMAGE;
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
    if (size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${maxSize / 1024 / 1024}MB`,
      );
    }
  }

  private generateKey(originalName: string, prefix: string = ''): string {
    const ext = path.extname(originalName).toLowerCase();
    const id = uuidv4();
    const date = new Date().toISOString().split('T')[0];
    return `${prefix}${date}/${id}${ext}`;
  }

  async uploadImage(
    file: Express.Multer.File,
    user: User,
    isPublic: boolean = true,
  ): Promise<File> {
    this.validateFile(file.mimetype, file.size);
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid image type. Allowed: JPEG, PNG, WebP, GIF',
      );
    }

    const processedBuffer = await sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const metadata = await sharp(processedBuffer).metadata();
    const key = this.generateKey(file.originalname, 'images/').replace(
      path.extname(this.generateKey(file.originalname)),
      '.webp',
    );

    const url = await this.storage.uploadFile(
      key,
      processedBuffer,
      'image/webp',
    );

    const thumbnailBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    const thumbnailKey = this.generateKey(
      file.originalname,
      'thumbnails/',
    ).replace(path.extname(this.generateKey(file.originalname)), '.webp');
    const thumbnailUrl = await this.storage.uploadFile(
      thumbnailKey,
      thumbnailBuffer,
      'image/webp',
    );

    const fileEntity = this.filesRepository.create({
      originalName: file.originalname,
      filename: path.basename(key),
      mimeType: 'image/webp',
      fileType: FileType.IMAGE,
      size: processedBuffer.length,
      bucket: this.storage.getBucket(),
      key,
      url,
      thumbnailKey,
      thumbnailUrl,
      width: metadata.width,
      height: metadata.height,
      isPublic,
      uploadedBy: user,
    });

    return this.filesRepository.save(fileEntity);
  }

  async uploadDocument(
    file: Express.Multer.File,
    user: User,
    isPublic: boolean = false,
  ): Promise<File> {
    this.validateFile(file.mimetype, file.size);
    if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid document type. Allowed: PDF, DOC, DOCX',
      );
    }

    const key = this.generateKey(file.originalname, 'documents/');
    const url = await this.storage.uploadFile(key, file.buffer, file.mimetype);

    const fileEntity = this.filesRepository.create({
      originalName: file.originalname,
      filename: path.basename(key),
      mimeType: file.mimetype,
      fileType: FileType.DOCUMENT,
      size: file.size,
      bucket: this.storage.getBucket(),
      key,
      url,
      isPublic,
      uploadedBy: user,
    });

    return this.filesRepository.save(fileEntity);
  }

  async findAll(): Promise<File[]> {
    return this.filesRepository.find({
      order: { createdAt: 'DESC' },
      relations: { uploadedBy: true },
    });
  }

  async findOne(id: string): Promise<File> {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async getPresignedUrl(id: string, expiry: number = 900): Promise<string> {
    const file = await this.findOne(id);
    return this.storage.getPresignedUrl(file.key, expiry);
  }

  async delete(id: string, user: User): Promise<void> {
    const file = await this.findOne(id);

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete files');
    }

    await this.storage.deleteFile(file.key);
    if (file.thumbnailKey) await this.storage.deleteFile(file.thumbnailKey);
    await this.filesRepository.remove(file);
  }

  async getStats(): Promise<any> {
    const total = await this.filesRepository.count();
    const totalSize = await this.filesRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'total')
      .getRawOne();
    const byType = await this.filesRepository
      .createQueryBuilder('file')
      .select('file.fileType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('file.fileType')
      .getRawMany();
    return { total, totalSize: parseInt(totalSize.total ?? 0), byType };
  }
}
