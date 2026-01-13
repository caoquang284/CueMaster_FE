"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookings, usePendingBookingsCount } from '@/lib/hooks/use-bookings';
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
import { Plus, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { BookingStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const highlightBookingId = searchParams.get('highlight');
  const { bookings, isLoading, isError, mutate } = useBookings();
  const { mutate: mutatePendingCount } = usePendingBookingsCount();
  const { tables } = useTables();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<any>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    userId: '',
    tableId: '',
    startTime: '',
    endTime: '',
  });

  // Scroll to and highlight booking when coming from notification
  useEffect(() => {
    if (highlightBookingId && bookings) {
      const element = document.getElementById(`booking-${highlightBookingId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [highlightBookingId, bookings]);

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
      await Promise.all([mutate(), mutatePendingCount()]);
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
      await Promise.all([mutate(), mutatePendingCount()]);
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
      await Promise.all([mutate(), mutatePendingCount()]);
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
                <TableHead>Customer</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings || []).map((booking) => {
                const isGuest = !booking.userId;
                const customerName = isGuest 
                  ? (booking.guestName || 'Guest') 
                  : (booking.user?.name || 'Customer');
                const isHighlighted = highlightBookingId === booking.id;
                
                return (
                <TableRow 
                  key={booking.id}
                  id={`booking-${booking.id}`}
                  className={`transition-all ${isHighlighted ? 'bg-red-50 dark:bg-red-950 border-2 border-red-500 animate-pulse' : ''}`}
                >
                  <TableCell className="font-medium">{booking.table?.code || booking.tableId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{customerName}</span>
                      <Badge variant={isGuest ? "secondary" : "default"} className="text-xs">
                        {isGuest ? "Guest" : "Customer"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                  <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                  <TableCell>{booking.totalPrice.toLocaleString()}đ</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailBooking(booking)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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
                          variant={isHighlighted ? "default" : "outline"}
                          className={isHighlighted ? "bg-green-600 hover:bg-green-700 animate-bounce" : ""}
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
                );
              })}
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

      {/* Booking Detail Dialog */}
      <Dialog open={!!detailBooking} onOpenChange={() => setDetailBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Booking Details #{detailBooking?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {detailBooking && (
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Customer & Booking Info */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Customer Information</h3>
                    <Badge variant={!detailBooking.userId ? "secondary" : "default"}>
                      {!detailBooking.userId ? "Guest" : "Registered"}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500">Name</Label>
                      <p className="font-medium">{!detailBooking.userId ? (detailBooking.guestName || 'N/A') : (detailBooking.user?.name || 'N/A')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Email</Label>
                      <p className="font-medium">{!detailBooking.userId ? (detailBooking.guestEmail || 'N/A') : (detailBooking.user?.email || 'N/A')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Phone</Label>
                      <p className="font-medium">{detailBooking.guestPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="font-semibold text-lg mb-4">Booking Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-slate-500">Table</Label>
                      <p className="font-bold text-lg">{detailBooking.table?.code} - {detailBooking.table?.type}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-slate-500">Rate</Label>
                      <p className="font-medium">{detailBooking.table?.priceHour?.toLocaleString()}đ/hour</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-slate-500">Duration</Label>
                      <p className="font-medium">
                        {((new Date(detailBooking.endTime).getTime() - new Date(detailBooking.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)}h
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Label className="text-xs text-slate-500">Status</Label>
                      {getStatusBadge(detailBooking.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Schedule & Payment */}
              <div className="space-y-6">
                {/* Schedule */}
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="font-semibold text-lg mb-4">Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500">Start Time</Label>
                      <p className="font-medium text-base">{formatDateTime(detailBooking.startTime)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">End Time</Label>
                      <p className="font-medium text-base">{formatDateTime(detailBooking.endTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="border rounded-lg p-4 bg-emerald-50 dark:bg-emerald-950">
                  <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Table Cost</span>
                      <span className="font-medium">{detailBooking.totalPrice.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Services</span>
                      <span className="font-medium">0đ</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                        {detailBooking.totalPrice.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs text-slate-500">Created</Label>
                      <p className="font-medium">{new Date(detailBooking.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Updated</Label>
                      <p className="font-medium">{new Date(detailBooking.updatedAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailBooking(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
