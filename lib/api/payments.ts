import apiClient from './client';
import { Payment } from '../types';

export interface CreatePaymentDto {
  orderId: string;
  method: 'CASH' | 'MOMO';
}

export const paymentsApi = {
  // Create payment (Admin/Staff)
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/payments', data);
    return response;
  },

  // Get payment by ID
  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response;
  },

  // Get all payments (Admin)
  getAll: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments');
    return response;
  },
};
