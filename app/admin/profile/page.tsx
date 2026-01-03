"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { usersApi } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/loaders/page-skeleton";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [updating, setUpdating] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return user?.email?.slice(0, 2).toUpperCase() || "U";
    return user.name
      .split(" ")
      .map(part => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }, [user?.name, user?.email]);

  if (isLoading) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You need to sign in to manage your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      setUpdating(true);
      await usersApi.updateMe({
        name: name || null,
        email: email,
      });
      
      toast({
        title: "Profile updated",
        description: "Your personal information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your personal information</p>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" alt={user.name || user.email} />
              <AvatarFallback className="text-2xl bg-blue-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {user.name || "No name set"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{user.email}</p>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {user.role}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">User ID</span>
              <span className="text-sm text-slate-900 dark:text-white font-mono">{user.id.slice(0, 8)}...</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Member Since</span>
              <span className="text-sm text-slate-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</span>
              <span className="text-sm text-slate-900 dark:text-white">
                {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
