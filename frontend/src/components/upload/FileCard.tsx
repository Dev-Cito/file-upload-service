'use client';
import { UploadedFile, FileType } from '@/types';
import { api } from '@/lib/api';
import { useState } from 'react';

interface FileCardProps {
  file: UploadedFile;
  onDelete: (id: string) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function FileCard({ file, onDelete }: FileCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this file?')) return;
    setDeleting(true);
    try {
      await api.delete(`/files/${file.id}`);
      onDelete(file.id);
    } catch {
      alert('Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = file.fileType === FileType.IMAGE;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition">
      {isImage ? (
        <div className="aspect-video bg-gray-50 overflow-hidden">
          <img
            src={file.thumbnailUrl ?? file.url}
            alt={file.originalName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gray-50 flex items-center justify-center text-4xl">
          📄
        </div>
      )}

      <div className="p-4">
        <p className="text-sm font-medium text-gray-900 truncate mb-1">
          {file.originalName}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>{formatSize(file.size)}</span>
          {file.width && <span>· {file.width}×{file.height}</span>}
          <span>· {new Date(file.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg transition"
          >
            {copied ? '✓ Copied' : 'Copy URL'}
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition"
          >
            View
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}