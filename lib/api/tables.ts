import apiClient from './client';
import { Table } from '../types';

export interface CreateTableDto {
  code: string;
  type: 'CAROM' | 'POOL' | 'SNOOKER';
  priceHour: number;
}

export interface UpdateTableStatusDto {
  status: 'IDLE' | 'PLAYING' | 'RESERVED';
}

export const tablesApi = {
  // Get all tables
  getAll: async (): Promise<Table[]> => {
    const response = await apiClient.get<Table[]>('/tables');
    return response;
  },

  // Get table by ID
  getById: async (id: string): Promise<Table> => {
    const response = await apiClient.get<Table>(`/tables/${id}`);
    return response;
  },

  // Create table (Admin/Staff)
  create: async (data: CreateTableDto): Promise<Table> => {
    const response = await apiClient.post<Table>('/tables', data);
    return response;
  },

  // Update table status
  updateStatus: async (id: string, data: UpdateTableStatusDto): Promise<Table> => {
    const response = await apiClient.patch<Table>(`/tables/${id}/status`, data);
    return response;
  },

  // Start table (set to PLAYING)
  start: async (id: string): Promise<Table> => {
    const response = await apiClient.patch<Table>(`/tables/${id}/start`, {});
    return response;
  },

  // End table (set to IDLE)
  end: async (id: string): Promise<Table> => {
    const response = await apiClient.patch<Table>(`/tables/${id}/end`, {});
    return response;
  },
};
