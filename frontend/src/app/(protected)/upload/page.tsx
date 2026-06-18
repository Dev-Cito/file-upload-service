'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { UploadedFile } from '@/types';
import Navbar from '@/components/ui/Navbar';
import Dropzone from '@/components/upload/Dropzone';
import FileCard from '@/components/upload/FileCard';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isAuthenticated) {
          const meRes = await api.get('/auth/me');
          setAuth(meRes.data.data);
        }
      } catch {
        router.push('/login');
      }
    };
    init();
  }, []);

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    setErrors([]);
    const results: UploadedFile[] = [];
    const errs: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        const isImage = file.type.startsWith('image/');

        if (isImage) {
          formData.append('file', file);
          const res = await api.post('/files/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          results.push(res.data.data);
        } else {
          formData.append('file', file);
          const res = await api.post('/files/upload/document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          results.push(res.data.data);
        }
      } catch (err: any) {
        errs.push(`${file.name}: ${err.response?.data?.message ?? 'Upload failed'}`);
      }
    }

    setUploadedFiles((prev) => [...results, ...prev]);
    setErrors(errs);
    setUploading(false);
  };

  const handleDelete = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Upload Files</h1>
            <p className="text-gray-500 text-sm mt-1">
              Images are auto-resized and converted to WebP · Documents stored as-is
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-black transition">
            ← My Files
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <Dropzone onFiles={handleFiles} loading={uploading} />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            {errors.map((err, i) => (
              <p key={i} className="text-red-600 text-sm">{err}</p>
            ))}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Uploaded ({uploadedFiles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <FileCard key={file.id} file={file} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}