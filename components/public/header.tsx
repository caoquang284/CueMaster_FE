"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleDot, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function PublicHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <CircleDot className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CueMaster</h1>
              <p className="text-xs text-slate-400">Premium Billiards</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#tables" className="text-slate-300 hover:text-white transition-colors">
              Tables
            </Link>
            <Link href="/#menu" className="text-slate-300 hover:text-white transition-colors">
              Menu
            </Link>
            <Link href="/#bookings" className="text-slate-300 hover:text-white transition-colors">
              My Bookings
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-400 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/login">
              <Button variant="outline" className="border-emerald-700 text-emerald-500 hover:bg-emerald-500/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
