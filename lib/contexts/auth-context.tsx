'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, LoginCredentials, RegisterData } from '../api/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage and verify token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token by fetching current user
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng ${response.user.name}!`,
      });

      // Redirect based on role
      if (response.user.role === 'ADMIN' || response.user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng nhập',
        description: error.message || 'Email hoặc mật khẩu không đúng',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast({
        title: 'Đăng ký thành công',
        description: 'Chào mừng bạn đến với CueMaster!',
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng ký',
        description: error.message || 'Không thể đăng ký tài khoản',
      });
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    toast({
      title: 'Đã đăng xuất',
      description: 'Hẹn gặp lại!',
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
