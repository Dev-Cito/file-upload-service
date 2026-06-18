import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}