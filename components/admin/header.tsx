"use client";

import { useAuth } from '@/lib/contexts/auth-context';
import { useUnreadCount } from '@/lib/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count: unreadCount } = useUnreadCount();

  const handleLogout = () => {
    logout();
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map(part => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2)
    : 'AD';

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 dark:border-slate-800 dark:bg-slate-900/50">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Xin chào, {user?.name || 'Admin'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Quản lý hệ thống bi-a của bạn</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          onClick={() => router.push('/admin/notifications')}
        >
          <Bell className="h-5 w-5" />
          {(unreadCount ?? 0) > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || 'admin@cuemaster.com'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/admin/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/admin/profile')}>
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/admin/settings')}>
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-500/10"
            >
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
