import apiClient from './client';
import { Booking, TimelineResponse } from '../types';

export interface CreateBookingDto {
  userId: string;
  tableId: string;
  startTime: string;
  endTime: string;
}

export interface CreatePublicBookingDto {
  tableId: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface UpdateBookingDto {
  startTime?: string;
  endTime?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export const bookingsApi = {
  // Get all bookings (Admin/Staff)
  getAll: async (): Promise<Booking[]> => {
    const response: Booking[] = await apiClient.get('/bookings');
    return response;
  },

  // Get pending bookings count
  getPendingCount: async (): Promise<number> => {
    const response: any = await apiClient.get('/bookings/pending/count');
    return response.count || 0;
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response: Booking = await apiClient.get(`/bookings/${id}`);
    return response;
  },

  // Get bookings by user ID
  getByUserId: async (userId: string): Promise<Booking[]> => {
    const response: Booking[] = await apiClient.get(`/bookings/user/${userId}`);
    return response;
  },

  // Create booking as guest (no login required)
  createPublic: async (data: CreatePublicBookingDto): Promise<Booking> => {
    const response: Booking = await apiClient.post('/bookings/public', data);
    return response;
  },

  // Create booking (authenticated users)
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response: Booking = await apiClient.post('/bookings', data);
    return response;
  },

  // Update booking
  update: async (id: string, data: UpdateBookingDto): Promise<Booking> => {
    const response: Booking = await apiClient.put(`/bookings/${id}`, data);
    return response;
  },

  // Cancel booking
  cancel: async (id: string): Promise<Booking> => {
    const response: Booking = await apiClient.put(`/bookings/${id}/cancel`, {});
    return response;
  },

  // Confirm booking (Admin/Staff)
  confirm: async (id: string): Promise<Booking> => {
    const response: Booking = await apiClient.put(`/bookings/${id}/confirm`, {});
    return response;
  },

  // Complete booking (Admin/Staff)
  complete: async (id: string): Promise<Booking> => {
    const response: Booking = await apiClient.patch(`/bookings/${id}/complete`, {});
    return response;
  },

  // Get timeline view for bookings
  getTimeline: async (date?: string): Promise<TimelineResponse> => {
    const url = date ? `/bookings/timeline?date=${date}` : '/bookings/timeline';
    const response: TimelineResponse = await apiClient.get(url);
    return response;
  },
};
