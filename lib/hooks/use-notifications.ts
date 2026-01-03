'use client';

import useSWR from 'swr';
import { notificationsApi } from '../api/notifications';
import { Notification } from '../types';

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<Notification[]>(
    '/notifications',
    () => notificationsApi.getAll(),
    { refreshInterval: 5000 } // Refresh every 5 seconds
  );

  return {
    notifications: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUnreadCount() {
  const { data, error, isLoading, mutate } = useSWR<number>(
    '/notifications/unread/count',
    () => notificationsApi.getUnreadCount(),
    { refreshInterval: 10000 } // Refresh every 10 seconds
  );

  return {
    count: data,
    isLoading,
    isError: error,
    mutate,
  };
}
