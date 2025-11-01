"use client";

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
  };

  const typeColors = {
    info: 'text-blue-500 bg-blue-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    success: 'text-emerald-500 bg-emerald-500/10',
    error: 'text-red-500 bg-red-500/10',
  };

  const typeBorderColors = {
    info: 'border-blue-500/20',
    warning: 'border-yellow-500/20',
    success: 'border-emerald-500/20',
    error: 'border-red-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Stay updated with system events</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllNotificationsRead}
            variant="outline"
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-500/10 dark:border-emerald-700 dark:text-emerald-500"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = typeIcons[notification.type];
            return (
              <Card
                key={notification.id}
                className={cn(
                  'border-l-4 bg-white transition-all duration-300 hover:shadow-lg dark:bg-slate-900',
                  typeBorderColors[notification.type],
                  !notification.read ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 opacity-60 dark:border-slate-800'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-lg', typeColors[notification.type])}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3
                          className={cn(
                            'font-semibold',
                            notification.read
                              ? 'text-slate-500 dark:text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p
                        className={cn(
                          'mb-2 text-sm',
                          notification.read
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-600 dark:text-slate-300'
                        )}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markNotificationRead(notification.id)}
                            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-sm text-slate-900 dark:text-white">Notification Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-slate-100 p-4 text-center dark:bg-slate-800">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {notifications.length}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Total</div>
            </div>
            <div className="rounded-lg bg-slate-100 p-4 text-center dark:bg-slate-800">
              <div className="text-2xl font-bold text-emerald-500">
                {unreadCount}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Unread</div>
            </div>
            <div className="rounded-lg bg-slate-100 p-4 text-center dark:bg-slate-800">
              <div className="text-2xl font-bold text-blue-500">
                {notifications.filter(n => n.type === 'info').length}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Info</div>
            </div>
            <div className="rounded-lg bg-slate-100 p-4 text-center dark:bg-slate-800">
              <div className="text-2xl font-bold text-yellow-500">
                {notifications.filter(n => n.type === 'warning').length}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Warnings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
