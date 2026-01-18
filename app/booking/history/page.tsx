"use client";

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookingStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await usersApi.getMyBookings();
      setBookings(data);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to load booking history', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config = {
      PENDING: { variant: 'secondary' as const, label: 'Pending', className: undefined },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed', className: undefined },
      IN_PROGRESS: { variant: 'default' as const, label: 'In Progress', className: 'bg-blue-600' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled', className: undefined },
      COMPLETED: { variant: 'outline' as const, label: 'Completed', className: undefined },
    };
    const cfg = config[status];
    return <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  if (loading) return <PageSkeleton />;

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalSpent = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.totalPrice || 0) + (b.order?.totalAmount || 0), 0);

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              My Booking History
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              View all your past and current bookings
            </p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {totalBookings}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {completedBookings}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {totalSpent.toLocaleString()}đ
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  No bookings found
                </p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                  Book a table to start your billiards experience!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Table Cost</TableHead>
                      <TableHead>Order Cost</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const duration = ((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1);
                      const orderTotal = booking.order?.totalAmount || 0;
                      const total = booking.totalPrice + orderTotal;
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="font-medium">{formatDateTime(booking.startTime)}</div>
                            <div className="text-xs text-slate-500">to {formatDateTime(booking.endTime)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">{booking.table?.code}</div>
                            <div className="text-xs text-slate-500">{booking.table?.type}</div>
                          </TableCell>
                          <TableCell>{duration}h</TableCell>
                          <TableCell>{booking.totalPrice.toLocaleString()}đ</TableCell>
                          <TableCell>{orderTotal.toLocaleString()}đ</TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            {total.toLocaleString()}đ
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    <PublicFooter />
    </>
  );
}
