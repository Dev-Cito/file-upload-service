'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { UploadedFile, ApiResponse } from '@/types';
import Navbar from '@/components/ui/Navbar';
import FileCard from '@/components/upload/FileCard';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isAuthenticated) {
          const meRes = await api.get('/auth/me');
          setAuth(meRes.data.data);
        }
        const [filesRes, statsRes] = await Promise.all([
          api.get<ApiResponse<UploadedFile[]>>('/files'),
          api.get<ApiResponse<any>>('/files/stats'),
        ]);
        setFiles(filesRes.data.data);
        setStats(statsRes.data.data);
      } catch {
        clearAuth();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Files</h1>
            <p className="text-gray-500 text-sm mt-1">
              {stats?.total ?? 0} files · {formatSize(stats?.totalSize ?? 0)} used
            </p>
          </div>
          <Link
            href="/upload"
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            + Upload
          </Link>
        </div>

        {stats?.byType?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.byType.map((t: any) => (
              <div key={t.type} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-2xl font-semibold text-gray-900">{t.count}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">{t.type}s</p>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">No files uploaded yet.</p>
            <Link
              href="/upload"
              className="text-sm bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
            >
              Upload your first file
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}