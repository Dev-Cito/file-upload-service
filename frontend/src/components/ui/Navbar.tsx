'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <nav className="bg-[#1e3a8a] border-b border-white/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-caveat)' }}>
          FileVault
        </Link>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition">
                My Files
              </Link>
              <Link href="/upload" className="text-sm text-white/70 hover:text-white transition">
                Upload
              </Link>
              <span className="text-sm text-white/40">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-white/60 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-white text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-white/90 transition font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}