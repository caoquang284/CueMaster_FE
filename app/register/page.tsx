"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu không khớp',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu phải có ít nhất 6 ký tự',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password, name });
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
          <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Tạo tài khoản</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Đăng ký tài khoản CueMaster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Họ và tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
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
                minLength={6}
                className="dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-200">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
