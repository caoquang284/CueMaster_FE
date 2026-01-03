import apiClient from './client';
import { Notification } from '../types';

export const notificationsApi = {
  // Get all notifications for current user
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    // Map content to message for easier use
    return response.data.map((n: Notification) => ({ ...n, message: n.content }));
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`, {});
    return { ...response.data, message: response.data.content };
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all', {});
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
