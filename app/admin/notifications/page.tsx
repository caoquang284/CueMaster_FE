"use client";

import { useState } from 'react';
import { useNotifications, useUnreadCount } from '@/lib/hooks/use-notifications';
import { notificationsApi } from '@/lib/api/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const { notifications, isLoading, isError, mutate } = useNotifications();
  const { count: unreadCount, mutate: mutateUnreadCount } = useUnreadCount();
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { toast } = useToast();

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load notifications</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      setActioningId(id);
      await notificationsApi.markAsRead(id);
      await Promise.all([mutate(), mutateUnreadCount()]);
      toast({ title: 'Success', description: 'Marked as read' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await Promise.all([mutate(), mutateUnreadCount()]);
      toast({ title: 'Success', description: 'All notifications marked as read' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      setActioningId(id);
      await notificationsApi.delete(id);
      await Promise.all([mutate(), mutateUnreadCount()]);
      toast({ title: 'Success', description: 'Notification deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      BOOKING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      ORDER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PAYMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      TABLE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      SYSTEM: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[type] || colors.SYSTEM;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {unreadCount && unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {(notifications || []).some(n => !n.isRead) && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(notifications || []).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  notification.isRead
                    ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                  <Bell className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {notification.message}
                  </p>

                  <div className="flex gap-2 mt-3">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={actioningId === notification.id}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                      disabled={actioningId === notification.id}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!notifications || notifications.length === 0) && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(notifications || []).filter(n => !n.isRead).length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Unread</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {(notifications || []).filter(n => n.type === 'BOOKING').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Bookings</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-500 mb-1">
              {(notifications || []).filter(n => n.type === 'ORDER').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Orders</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {(notifications || []).filter(n => n.type === 'PAYMENT').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Payments</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
