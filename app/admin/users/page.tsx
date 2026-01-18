"use client";

import { useState } from 'react';
import { useUsers } from '@/lib/hooks/use-users';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MoreVertical, History } from 'lucide-react';
import { User, UserRole, BookingStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
  const { users, isLoading, isError, mutate } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CUSTOMER' as UserRole,
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load users</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        name: user.name || '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'CUSTOMER',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.email || (!editingUser && !formData.password)) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          email: formData.email,
          name: formData.name || null,
        });
        if (formData.role !== editingUser.role) {
          await usersApi.updateRole(editingUser.id, formData.role);
        }
        toast({ title: 'Success', description: 'User updated' });
      } else {
        await usersApi.create({
          email: formData.email,
          password: formData.password,
          name: formData.name || null,
          role: formData.role,
        });
        toast({ title: 'Success', description: 'User created' });
      }

      await mutate();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      setActioningId(id);
      await usersApi.deactivate(id);
      await mutate();
      toast({ title: 'Success', description: 'User deactivated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const handleViewHistory = async (user: User) => {
    setHistoryUser(user);
    setLoadingHistory(true);
    try {
      const bookings = await usersApi.getUserBookings(user.id);
      setUserBookings(bookings);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setUserBookings([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed' },
      IN_PROGRESS: { variant: 'default' as const, label: 'In Progress', className: 'bg-blue-600' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
      COMPLETED: { variant: 'outline' as const, label: 'Completed' },
    };
    const cfg = config[status];
    return <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const getRoleBadge = (role: UserRole) => {
    const config = {
      ADMIN: { variant: 'destructive' as const, label: 'Admin' },
      STAFF: { variant: 'default' as const, label: 'Staff' },
      CUSTOMER: { variant: 'secondary' as const, label: 'Customer' },
    };
    return <Badge variant={config[role].variant}>{config[role].label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Users</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage system users</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">All Users</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                <SelectTrigger className="w-full sm:w-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={actioningId === user.id}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewHistory(user)}>
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        {user.isActive && (
                          <DropdownMenuItem 
                            onClick={() => handleDeactivate(user.id)}
                            className="text-red-600"
                          >
                            Deactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {!editingUser && '*'}</Label>
              <Input
                id="password"
                type="password"
                placeholder={editingUser ? 'Leave blank to keep current' : ''}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingUser ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-500 mb-1">
              {(users || []).filter(u => u.role === 'ADMIN').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Admins</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(users || []).filter(u => u.role === 'STAFF').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Staff</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {(users || []).filter(u => u.role === 'CUSTOMER').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Customers</div>
          </CardContent>
        </Card>
      </div>

      {/* User Booking History Dialog */}
      <Dialog open={!!historyUser} onOpenChange={() => { setHistoryUser(null); setUserBookings([]); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Booking History - {historyUser?.name || historyUser?.email}
            </DialogTitle>
          </DialogHeader>
          
          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <div className="text-slate-600 dark:text-slate-400">Loading...</div>
            </div>
          ) : userBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No booking history found
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {userBookings.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Total Bookings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-green-500">
                      {userBookings.filter(b => b.status === 'COMPLETED').length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Completed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-blue-500">
                      {userBookings.filter(b => b.status === 'IN_PROGRESS').length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">In Progress</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-emerald-600">
                      {userBookings.reduce((sum, b) => sum + (b.totalPrice || 0) + (b.order?.totalAmount || 0), 0).toLocaleString()}đ
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Total Revenue</div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Table Cost</TableHead>
                    <TableHead>Order Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBookings.map((booking) => {
                    const duration = ((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1);
                    const orderTotal = booking.order?.totalAmount || 0;
                    const total = booking.totalPrice + orderTotal;
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {formatDateTime(booking.startTime)}
                        </TableCell>
                        <TableCell>{booking.table?.code}</TableCell>
                        <TableCell>{duration}h</TableCell>
                        <TableCell>{booking.totalPrice.toLocaleString()}đ</TableCell>
                        <TableCell>{orderTotal.toLocaleString()}đ</TableCell>
                        <TableCell className="font-bold">{total.toLocaleString()}đ</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setHistoryUser(null); setUserBookings([]); }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
