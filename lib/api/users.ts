import apiClient from './client';
import { User } from '../types';

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface UpdateRoleDto {
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export const usersApi = {
  // Get all users (Admin/Staff)
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response;
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response;
  },

  // Update current user profile
  updateMe: async (data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response;
  },

  // Update user (Admin)
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response;
  },

  // Update user role (Admin)
  updateRole: async (id: string, data: UpdateRoleDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/role`, data);
    return response;
  },

  // Deactivate user (Admin)
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/deactivate`, {});
    return response;
  },

  // Create user (Admin)
  create: async (data: { email: string; password: string; name: string; role?: string }): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response;
  },

  // Get user booking history (Admin)
  getUserBookings: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/users/${userId}/bookings`);
    return response;
  },

  // Get my booking history
  getMyBookings: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/users/me/bookings');
    return response;
  },
};
