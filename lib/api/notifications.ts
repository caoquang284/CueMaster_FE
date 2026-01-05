import apiClient from './client';
import { Notification } from '../types';

export const notificationsApi = {
  // Get all notifications for current user
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications/my');
    // Interceptor already unwraps response.data.data to just the array
    return response.map((n: any) => ({ ...n, message: n.content }));
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/my/unread-count');
    // Interceptor already unwraps response.data.data
    return response.count;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`, {});
    return { ...response as any, message: (response as any).content };
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
