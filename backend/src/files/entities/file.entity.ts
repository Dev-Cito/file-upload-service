import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  mimeType: string;

  @Column({ type: 'enum', enum: FileType, default: FileType.OTHER })
  fileType: FileType;

  @Column()
  size: number;

  @Column()
  bucket: string;

  @Column()
  key: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailKey: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}