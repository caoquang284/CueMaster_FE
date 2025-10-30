"use client";

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, logout, notifications } = useAppStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Welcome back, {user?.name || 'Admin'}
        </h2>
        <p className="text-sm text-slate-400">Manage your billiard business</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-slate-400 hover:text-white"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white relative"
          onClick={() => router.push('/admin/notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
