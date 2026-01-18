"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { User, Lock, Mail } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      const userData = await usersApi.getMe();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load profile', 
        variant: 'destructive' 
      });
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({ 
        title: 'Error', 
        description: 'Passwords do not match', 
        variant: 'destructive' 
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast({ 
        title: 'Error', 
        description: 'Password must be at least 6 characters', 
        variant: 'destructive' 
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = { 
        name: formData.name || null,
        phone: formData.phone || null
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await usersApi.updateMe(updateData);
      toast({ 
        title: 'Success', 
        description: 'Profile updated successfully' 
      });
      
      // Reload profile
      const userData = await usersApi.getMe();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update profile', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your account information
            </p>
          </div>

          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="border-t pt-6 dark:border-slate-700">
                  <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Change Password</h3>
                  
                  {/* New Password */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  {/* Confirm Password */}
                  {formData.password && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
