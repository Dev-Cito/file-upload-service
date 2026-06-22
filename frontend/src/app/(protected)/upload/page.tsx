'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, RotateCcw, FileText, Loader2 } from '@/lib/icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { UploadedFile } from '@/types';
import Navbar from '@/components/ui/Navbar';
import Dropzone from '@/components/upload/Dropzone';

/* ─── Queue item types ─────────────────────────────────────── */

type Status = 'pending' | 'uploading' | 'done' | 'error';

interface QueueItem {
  uid: string;
  file: File;
  previewUrl: string | null;
  status: Status;
  progress: number;
  error?: string;
  result?: UploadedFile;
}

/* ─── Upload page ──────────────────────────────────────────── */

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const objectUrls = useRef<string[]>([]);
  const idRef = useRef(0);

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
    return () => {
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  /* Functional state patch — always reads fresh state */
  const patch = (uid: string, update: Partial<QueueItem>) =>
    setQueue((q) => q.map((i) => (i.uid === uid ? { ...i, ...update } : i)));

  /* Upload a single file independently */
  const upload = async (uid: string, file: File) => {
    patch(uid, { status: 'uploading', progress: 0, error: undefined });
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = file.type.startsWith('image/')
      ? '/files/upload/image'
      : '/files/upload/document';
    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 50;
          patch(uid, { progress: pct });
        },
      });
      patch(uid, { status: 'done', progress: 100, result: res.data.data });
    } catch (err: any) {
      patch(uid, {
        status: 'error',
        error: err.response?.data?.message ?? 'Upload failed',
      });
    }
  };

  /* Add files to queue + start all uploads in parallel */
  const handleFiles = (files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => {
      const uid = `q${++idRef.current}`;
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;
      if (previewUrl) objectUrls.current.push(previewUrl);
      return { uid, file, previewUrl, status: 'pending', progress: 0 };
    });
    setQueue((q) => [...q, ...newItems]);
    newItems.forEach(({ uid, file }) => upload(uid, file));
  };

  const clearAll = () => {
    objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrls.current = [];
    setQueue([]);
  };

  const done = queue.filter((i) => i.status === 'done').length;
  const errors = queue.filter((i) => i.status === 'error').length;
  const active = queue.filter(
    (i) => i.status === 'uploading' || i.status === 'pending',
  ).length;

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Upload Files</h1>
            <p className="text-white/50 text-sm mt-1">
              Images auto-resized to WebP · Documents stored as-is
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-white/40 hover:text-white transition"
          >
            ← My Files
          </Link>
        </div>

        {/* Drop zone */}
        <div className="mb-6">
          <Dropzone onFiles={handleFiles} disabled={false} />
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div>
            {/* Queue status bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                {active > 0 && (
                  <span className="text-white/70 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {active} uploading
                  </span>
                )}
                {done > 0 && (
                  <span className="text-green-400">{done} done</span>
                )}
                {errors > 0 && (
                  <span className="text-red-400">{errors} failed</span>
                )}
              </div>
              {active === 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-white/30 hover:text-white/60 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3">
              {queue.map((item) => (
                <QueueCard
                  key={item.uid}
                  item={item}
                  onRetry={() => upload(item.uid, item.file)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Queue item card ──────────────────────────────────────── */

function QueueCard({
  item,
  onRetry,
}: {
  item: QueueItem;
  onRetry: () => void;
}) {
  const sizeStr =
    item.file.size < 1024 * 1024
      ? `${(item.file.size / 1024).toFixed(1)} KB`
      : `${(item.file.size / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div
      className="rounded-2xl flex items-center gap-4 p-4 transition-all duration-300"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      {/* Thumbnail preview */}
      <div
        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="w-6 h-6 text-white/30" />
        )}
      </div>

      {/* Name + progress */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate mb-0.5">
          {item.file.name}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/40">{sizeStr}</span>
          {item.status === 'error' && (
            <span className="text-xs text-red-300 truncate">{item.error}</span>
          )}
          {item.status === 'done' && (
            <span className="text-xs text-green-400">Uploaded</span>
          )}
          {item.status === 'pending' && (
            <span className="text-xs text-white/30">Waiting…</span>
          )}
        </div>

        {/* Real progress bar */}
        {(item.status === 'uploading' || item.status === 'pending') && (
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${item.status === 'pending' ? 0 : item.progress}%`,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.95))',
              }}
            />
          </div>
        )}

        {item.status === 'done' && (
          <div
            className="h-1.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.45)', width: '100%' }}
          />
        )}

        {item.status === 'error' && (
          <div
            className="h-1.5 rounded-full"
            style={{ background: 'rgba(248,113,113,0.45)', width: '100%' }}
          />
        )}
      </div>

      {/* Right: percentage / status icon / retry */}
      <div className="flex-shrink-0 flex items-center justify-center w-10">
        {item.status === 'uploading' && (
          <span className="text-xs font-medium text-white/60 tabular-nums">
            {item.progress}%
          </span>
        )}
        {item.status === 'pending' && (
          <Loader2 className="w-4 h-4 text-white/25 animate-spin" />
        )}
        {item.status === 'done' && (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        )}
        {item.status === 'error' && (
          <button
            onClick={onRetry}
            title="Retry upload"
            className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(248,113,113,0.18)' }}
          >
            <RotateCcw className="w-4 h-4 text-red-300" />
          </button>
        )}
      </div>
    </div>
  );
}
