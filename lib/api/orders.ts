import apiClient from './client';
import { Order, OrderItem } from '../types';

export interface CreateOrderDto {
  tableId: string;
  bookingId?: string;
}

export interface AddOrderItemDto {
  menuItemId: string;
  quantity: number;
}

export interface UpdateOrderItemDto {
  quantity: number;
}

export const ordersApi = {
  // Get all orders (Admin/Staff)
  getAll: async (filters?: { tableId?: string; status?: string }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.tableId) params.append('tableId', filters.tableId);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await apiClient.get<Order[]>(`/orders?${params.toString()}`);
    return response;
  },

  // Get order by ID
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response;
  },

  // Create order (Admin/Staff)
  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', data);
    return response;
  },

  // Add item to order
  addItem: async (orderId: string, data: AddOrderItemDto): Promise<Order> => {
    const response = await apiClient.post<Order>(`/orders/${orderId}/items`, data);
    return response;
  },

  // Update order item
  updateItem: async (orderId: string, itemId: string, data: UpdateOrderItemDto): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${orderId}/items/${itemId}`, data);
    return response;
  },

  // Remove item from order
  removeItem: async (orderId: string, itemId: string): Promise<Order> => {
    const response = await apiClient.delete<Order>(`/orders/${orderId}/items/${itemId}`);
    return response;
  },

  // Close order
  close: async (id: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/close`, {});
    return response;
  },
};
