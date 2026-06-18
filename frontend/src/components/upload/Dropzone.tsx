'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  loading?: boolean;
}

export default function Dropzone({
  onFiles,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  loading = false,
}: DropzoneProps) {
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        setError(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
      } else {
        setError(err.message);
      }
      return;
    }
    onFiles(acceptedFiles);
  }, [onFiles, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: loading,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-black bg-gray-50'
            : 'border-gray-200 hover:border-gray-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
            {loading ? '⏳' : isDragActive ? '📂' : '📁'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {loading
                ? 'Uploading...'
                : isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              or click to browse · Images & PDFs · Max {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}