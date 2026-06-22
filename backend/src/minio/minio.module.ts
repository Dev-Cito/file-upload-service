import { Module, Global } from '@nestjs/common';
import { MinioService } from './minio.service';
import { SupabaseStorageService } from './supabase-storage.service';

@Global()
@Module({
  providers: [MinioService, SupabaseStorageService],
  exports: [MinioService, SupabaseStorageService],
})
export class MinioModule {}