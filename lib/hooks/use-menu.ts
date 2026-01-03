'use client';

import useSWR from 'swr';
import { menuApi } from '../api/menu';
import { MenuItem } from '../types';

export function useMenu() {
  const { data, error, isLoading, mutate } = useSWR<MenuItem[]>(
    '/menu',
    () => menuApi.getAll()
  );

  return {
    menuItems: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMenuItem(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MenuItem>(
    id ? `/menu/${id}` : null,
    () => id ? menuApi.getById(id) : null
  );

  return {
    menuItem: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMenuByCategory(category: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MenuItem[]>(
    category ? `/menu/category/${category}` : null,
    () => category ? menuApi.getByCategory(category) : null
  );

  return {
    menuItems: data,
    isLoading,
    isError: error,
    mutate,
  };
}
