import apiClient from './client';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response;
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
