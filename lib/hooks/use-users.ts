'use client';

import useSWR from 'swr';
import { usersApi } from '../api/users';
import { User } from '../types';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>(
    '/users',
    () => usersApi.getAll()
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUser(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/users/${id}` : null,
    id ? () => usersApi.getById(id) : null
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
