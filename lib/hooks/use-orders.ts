'use client';

import useSWR from 'swr';
import { ordersApi } from '../api/orders';
import { Order } from '../types';

export function useOrders(filters?: { tableId?: string; status?: string }) {
  const key = filters 
    ? `/orders?${new URLSearchParams(filters as any).toString()}`
    : '/orders';
    
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    key,
    () => ordersApi.getAll(filters)
  );

  return {
    orders: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useOrder(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Order>(
    id ? `/orders/${id}` : null,
    () => id ? ordersApi.getById(id) : null
  );

  return {
    order: data,
    isLoading,
    isError: error,
    mutate,
  };
}
