"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Square,
  Calendar,
  UtensilsCrossed,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Bell,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import type { UserRole } from '@/lib/types';
import { useUnreadCount } from '@/lib/hooks/use-notifications';
import { usePendingBookingsCount } from '@/lib/hooks/use-bookings';
import { Badge } from '@/components/ui/badge';

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  roles?: UserRole[];
};

const menuItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Square, label: 'Tables', href: '/admin/tables' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'Users', href: '/admin/users', roles: ['ADMIN'] },
  { icon: UtensilsCrossed, label: 'Menu', href: '/admin/menu' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count: unreadCount } = useUnreadCount();
  const { count: pendingBookingsCount } = usePendingBookingsCount();
  const userRole = (user?.role ?? 'staff') as UserRole;
  const filteredMenu = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <img src="/favicon.png" alt="Logo" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">CueMaster</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">Management Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isNotifications = item.href === '/admin/notifications';
            const isBookings = item.href === '/admin/bookings';
            const showNotificationBadge = isNotifications && (unreadCount ?? 0) > 0;
            const showBookingsBadge = isBookings && (pendingBookingsCount ?? 0) > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {showNotificationBadge && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  {showBookingsBadge && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                    >
                      {pendingBookingsCount}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
