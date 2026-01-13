import apiClient from './client';
import { Notification } from '../types';

export const notificationsApi = {
  // Get all notifications for current user
  getAll: async (): Promise<Notification[]> => {
    const data = await apiClient.get('/notifications/my') as any as Notification[];
    return data.map((n: any) => ({ ...n, message: n.content }));
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const data = await apiClient.get('/notifications/my/unread-count') as any as { count: number };
    return data.count;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const data = await apiClient.patch(`/notifications/${id}/read`, {}) as any;
    return { ...data, message: data.content };
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read/all', {});
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
