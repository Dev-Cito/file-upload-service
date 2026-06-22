import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private client: SupabaseClient;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.client = createClient(
      this.config.get('SUPABASE_URL'),
      this.config.get('SUPABASE_SERVICE_KEY'),
    );
    this.bucket = this.config.get('SUPABASE_BUCKET') ?? 'uploads';
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw new Error(`Supabase upload error: ${error.message}`);
    return this.getPublicUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([key]);
    if (error) throw new Error(`Supabase delete error: ${error.message}`);
  }

  async getPresignedUrl(key: string, expiry: number = 900): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expiry);
    if (error) throw new Error(`Supabase signed URL error: ${error.message}`);
    return data.signedUrl;
  }

  getPublicUrl(key: string): string {
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(key);
    return data.publicUrl;
  }

  getBucket(): string {
    return this.bucket;
  }
}