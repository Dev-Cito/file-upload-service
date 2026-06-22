'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from '@/lib/icons';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export default function Dropzone({
  onFiles,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  disabled = false,
}: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 overflow-hidden select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragActive ? 'scale-[1.015]' : 'hover:scale-[1.005]'}`}
      style={{
        background: isDragActive
          ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isDragActive
          ? '2px dashed rgba(255,255,255,0.55)'
          : '2px dashed rgba(255,255,255,0.22)',
        boxShadow: isDragActive
          ? '0 0 0 4px rgba(255,255,255,0.08), inset 0 0 60px rgba(255,255,255,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      <input {...getInputProps()} />

      {/* Animated corner accents on drag */}
      {isDragActive && (
        <>
          <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
          <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
          <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
          <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
        </>
      )}

      <div className="relative flex flex-col items-center gap-5">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragActive ? 'scale-125 rotate-3' : ''}`}
          style={{
            background: isDragActive
              ? 'rgba(255,255,255,0.22)'
              : 'rgba(255,255,255,0.10)',
            boxShadow: isDragActive ? '0 8px 32px rgba(255,255,255,0.15)' : 'none',
          }}
        >
          <CloudUpload
            className={`w-8 h-8 text-white transition-all duration-300 ${isDragActive ? 'opacity-100' : 'opacity-60'}`}
          />
        </div>

        {/* Text */}
        <div>
          <p className={`text-base font-semibold transition-all duration-200 ${isDragActive ? 'text-white' : 'text-white/70'}`}>
            {isDragActive ? '✦ Release to add files' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-white/40 mt-1">
            or click to browse · Images & PDFs · Max {maxSize / 1024 / 1024} MB
          </p>
        </div>
      </div>
    </div>
  );
}
