"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
import { PageSkeleton } from '@/components/loaders/page-skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF'))) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageSkeleton />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950/40">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
