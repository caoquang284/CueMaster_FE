'use client';

import useSWR from 'swr';
import { paymentsApi } from '../api/payments';
import { Payment } from '../types';

export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR<Payment[]>(
    '/payments',
    () => paymentsApi.getAll()
  );

  return {
    payments: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePayment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Payment>(
    id ? `/payments/${id}` : null,
    () => id ? paymentsApi.getById(id) : null
  );

  return {
    payment: data,
    isLoading,
    isError: error,
    mutate,
  };
}
