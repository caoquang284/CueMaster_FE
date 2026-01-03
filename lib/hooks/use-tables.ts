'use client';

import useSWR from 'swr';
import { tablesApi } from '../api/tables';
import { Table } from '../types';

export function useTables() {
  const { data, error, isLoading, mutate } = useSWR<Table[]>(
    '/tables',
    () => tablesApi.getAll()
  );

  return {
    tables: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTable(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Table>(
    id ? `/tables/${id}` : null,
    () => id ? tablesApi.getById(id) : null
  );

  return {
    table: data,
    isLoading,
    isError: error,
    mutate,
  };
}
