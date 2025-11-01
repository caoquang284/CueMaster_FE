"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleDot, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function PublicHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <img src="/favicon.png" alt="Logo" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">CueMaster</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Premium Billiards</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#tables"
              className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Tables
            </Link>
            <Link
              href="/#menu"
              className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Menu
            </Link>
            <Link
              href="/#bookings"
              className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              My Bookings
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 dark:border-emerald-700 dark:text-emerald-500"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
