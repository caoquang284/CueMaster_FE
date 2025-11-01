"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import type { User, UserRole, UserStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type UserFormState = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  bio: string;
  avatarUrl: string;
  password: string;
};

const defaultForm: UserFormState = {
  name: "",
  email: "",
  role: "staff",
  status: "active",
  phone: "",
  bio: "",
  avatarUrl: "",
  password: "",
};

const generatePassword = () =>
  Math.random().toString(36).slice(-10);

export default function UsersPage() {
  const users = useAppStore((state) => state.users);
  const currentUser = useAppStore((state) => state.user);
  const addUser = useAppStore((state) => state.addUser);
  const updateUser = useAppStore((state) => state.updateUser);
  const deleteUser = useAppStore((state) => state.deleteUser);
  const toggleUserStatus = useAppStore((state) => state.toggleUserStatus);
  const resetUserPasswordByAdmin = useAppStore((state) => state.resetUserPasswordByAdmin);

  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formState, setFormState] = useState<UserFormState>(defaultForm);

  if (currentUser?.role !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You do not have permission to access this section.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !term ||
        [user.name, user.email, user.role, user.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  const openCreateDialog = () => {
    setFormMode("create");
    setFormState({ ...defaultForm, password: generatePassword() });
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setFormMode("edit");
    setEditingUser(user);
    setFormState({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      password: "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormState(defaultForm);
  };

  const handleFormChange = (field: keyof UserFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formMode === "create") {
      const result = addUser({
        name: formState.name.trim(),
        email: formState.email.trim(),
        role: formState.role,
        status: formState.status,
        phone: formState.phone.trim(),
        bio: formState.bio.trim(),
        avatarUrl: formState.avatarUrl.trim() || undefined,
        password: formState.password.trim() || undefined,
      });

      if (!result.success) {
        if (result.error === "duplicate_email") {
          toast({
            title: "Duplicate email",
            description: "Another account already uses this email address.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "User created",
        description: `Account for ${result.user?.name ?? formState.name} has been created.`,
      });
      closeDialog();
      return;
    }

    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: formState.name.trim(),
      role: formState.role,
      status: formState.status,
      phone: formState.phone.trim(),
      bio: formState.bio.trim(),
      avatarUrl: formState.avatarUrl.trim() || undefined,
    });

    toast({
      title: "User updated",
      description: `${formState.name} has been updated successfully.`,
    });

    closeDialog();
  };

  const handleDelete = (user: User) => {
    if (currentUser?.id === user.id) {
      toast({
        title: "Action not allowed",
        description: "You cannot delete the account you are currently signed in with.",
        variant: "destructive",
      });
      return;
    }

    const confirm = window.confirm(`Delete the account "${user.name}"? This cannot be undone.`);
    if (!confirm) return;
    deleteUser(user.id);
    toast({
      title: "User deleted",
      description: `${user.name}'s account has been removed.`,
    });
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = toggleUserStatus(user.id);
    if (!nextStatus) return;
    toast({
      title: nextStatus === "active" ? "User reinstated" : "User banned",
      description:
        nextStatus === "active"
          ? `${user.name} can access the system again.`
          : `${user.name} has been banned and can no longer sign in.`,
    });
  };

  const handleResetPassword = (user: User) => {
    const newPassword = generatePassword();
    const success = resetUserPasswordByAdmin(user.id, newPassword);
    if (!success) {
      toast({
        title: "Reset failed",
        description: "Unable to reset the password. Please try again.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password reset",
      description: `Temporary password for ${user.name} is "${newPassword}". Share it securely and recommend changing it after login.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Users</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage users and their status</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700 self-start md:self-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add user
        </Button>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <CardTitle className="whitespace-nowrap">All Users</CardTitle>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 sm:w-64 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as "all" | UserRole)}>
              <SelectTrigger className="w-full sm:w-40 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[720px] divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Last login</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "capitalize",
                          user.status === "active" ? "bg-emerald-500" : "bg-red-500"
                        )}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "No login"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => openEditDialog(user)}>
                            Edit profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleResetPassword(user)}>
                            Reset password
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggleStatus(user)}>
                            {user.status === "active" ? "Ban user" : "Reinstate user"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleDelete(user)}
                            className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-500/10"
                          >
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                    >
                      No users match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add new user" : "Edit user"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleFormChange("email", event.target.value)}
                  placeholder="user@example.com"
                  required
                  disabled={formMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formState.role}
                  onValueChange={(value: UserRole) => handleFormChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value: UserStatus) => handleFormChange("status", value)}
                  disabled={formMode === "create"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formState.phone}
                onChange={(event) => handleFormChange("phone", event.target.value)}
                placeholder="+84 912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={formState.avatarUrl}
                onChange={(event) => handleFormChange("avatarUrl", event.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={formState.bio}
                onChange={(event) => handleFormChange("bio", event.target.value)}
                placeholder="Short description"
              />
            </div>
            {formMode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Temporary password</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="password"
                    value={formState.password}
                    onChange={(event) => handleFormChange("password", event.target.value)}
                    placeholder="Initial password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFormChange("password", generatePassword())}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {formMode === "create" ? "Create user" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
