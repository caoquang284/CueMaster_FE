import apiClient from './client';
import { MenuItem } from '../types';

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable?: boolean;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  isAvailable?: boolean;
}

export const menuApi = {
  // Get all menu items
  getAll: async (): Promise<MenuItem[]> => {
    const response: MenuItem[] = await apiClient.get('/menu');
    return response;
  },

  // Get menu item by ID
  getById: async (id: string): Promise<MenuItem> => {
    const response: MenuItem = await apiClient.get(`/menu/${id}`);
    return response;
  },

  // Get menu items by category
  getByCategory: async (category: string): Promise<MenuItem[]> => {
    const response: MenuItem[] = await apiClient.get(`/menu/category/${category}`);
    return response;
  },

  // Create menu item (Admin/Staff)
  create: async (data: CreateMenuItemDto): Promise<MenuItem> => {
    const response: MenuItem = await apiClient.post('/menu', data);
    return response;
  },

  // Update menu item (Admin/Staff)
  update: async (id: string, data: UpdateMenuItemDto): Promise<MenuItem> => {
    const response: MenuItem = await apiClient.put(`/menu/${id}`, data);
    return response;
  },

  // Delete menu item (Admin/Staff)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu/${id}`);
  },

  // Toggle availability
  toggleAvailability: async (id: string): Promise<MenuItem> => {
    const response: MenuItem = await apiClient.patch(`/menu/${id}/toggle-availability`, {});
    return response;
  },
};
