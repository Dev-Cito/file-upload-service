export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other',
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  fileType: FileType;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  isPublic: boolean;
  uploadedBy: User;
  createdAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}