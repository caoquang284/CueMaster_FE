"use client";

import { useState } from 'react';
import { useBookings } from '@/lib/hooks/use-bookings';
import { useTables } from '@/lib/hooks/use-tables';
import { bookingsApi } from '@/lib/api/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BookingStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';

export default function BookingsPage() {
  const { bookings, isLoading, isError, mutate } = useBookings();
  const { tables } = useTables();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    userId: '',
    tableId: '',
    startTime: '',
    endTime: '',
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load bookings</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleCreateBooking = async () => {
    if (!formData.userId || !formData.tableId || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bookingsApi.create({
        userId: formData.userId,
        tableId: formData.tableId,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      await mutate();
      toast({ title: 'Success', description: 'Booking created successfully' });
      setIsDialogOpen(false);
      setFormData({ userId: '', tableId: '', startTime: '', endTime: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      setActioningId(id);
      await bookingsApi.confirm(id);
      await mutate();
      toast({ title: 'Success', description: 'Booking confirmed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setActioningId(id);
      await bookingsApi.cancel(id);
      await mutate();
      toast({ title: 'Success', description: 'Booking cancelled' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setActioningId(id);
      await bookingsApi.complete(id);
      await mutate();
      toast({ title: 'Success', description: 'Booking completed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
      COMPLETED: { variant: 'outline' as const, label: 'Completed' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Bookings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage table bookings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableId">Table</Label>
                <Select value={formData.tableId} onValueChange={(value) => setFormData({ ...formData, tableId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tables || []).map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.code} - {table.type} ({table.priceHour.toLocaleString()}đ/h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateBooking}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings || []).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.table?.code || booking.tableId}</TableCell>
                  <TableCell>{booking.user?.name || booking.userId}</TableCell>
                  <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                  <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                  <TableCell>{booking.totalPrice.toLocaleString()}đ</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={actioningId === booking.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(booking.id)}
                            disabled={actioningId === booking.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(booking.id)}
                          disabled={actioningId === booking.id}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!bookings || bookings.length === 0) && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No bookings found
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-500 mb-1">
              {(bookings || []).filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {(bookings || []).filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Confirmed</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(bookings || []).filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-500 mb-1">
              {(bookings || []).filter(b => b.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Cancelled</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
