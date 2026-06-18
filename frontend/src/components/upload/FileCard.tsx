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
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
    >
      {/* Image / placeholder */}
      {isImage ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={file.thumbnailUrl ?? file.url}
            alt={file.originalName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="aspect-video flex items-center justify-center text-4xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          📄
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <p className="text-sm font-semibold text-white truncate mb-1">
          {file.originalName}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
          <span>{formatSize(file.size)}</span>
          {file.width && <span>· {file.width}×{file.height}</span>}
          <span>· {new Date(file.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: copied ? 'rgba(134,239,172,1)' : 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            {copied ? '✓ Copied' : 'Copy URL'}
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            View
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-40"
            style={{
              background: 'rgba(239,68,68,0.2)',
              color: 'rgba(252,165,165,1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
            onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = 'rgba(239,68,68,0.35)' }}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
