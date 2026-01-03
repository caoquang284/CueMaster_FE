'use client';

import useSWR from 'swr';
import { bookingsApi } from '../api/bookings';
import { Booking } from '../types';

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    '/bookings',
    () => bookingsApi.getAll()
  );

  return {
    bookings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBooking(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Booking>(
    id ? `/bookings/${id}` : null,
    () => id ? bookingsApi.getById(id) : null
  );

  return {
    booking: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserBookings(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    userId ? `/bookings/user/${userId}` : null,
    () => userId ? bookingsApi.getByUserId(userId) : null
  );

  return {
    bookings: data,
    isLoading,
    isError: error,
    mutate,
  };
}
