"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (error) {
      // Error handling is done in auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-emerald-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <Card className="w-full max-w-md border-emerald-300/50 bg-white/90 backdrop-blur dark:border-emerald-900/20 dark:bg-slate-900/90">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-emerald-500/10 p-3 rounded-full">
              <img src="/favicon.png" alt="Logo" className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">CueMaster</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Đăng nhập vào hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@cuemaster.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
