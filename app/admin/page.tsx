"use client";

import { useTables } from '@/lib/hooks/use-tables';
import { useBookings } from '@/lib/hooks/use-bookings';
import { usePayments } from '@/lib/hooks/use-payments';
import { useOrders } from '@/lib/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Square, Calendar, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { tables, isLoading: tablesLoading } = useTables();
  const { bookings, isLoading: bookingsLoading } = useBookings();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { orders, isLoading: ordersLoading } = useOrders({});

  if (tablesLoading || bookingsLoading || paymentsLoading || ordersLoading) {
    return <PageSkeleton />;
  }

  // Calculate stats
  const totalRevenue = (payments || [])
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.total, 0);

  const activeTables = (tables || []).filter(t => t.status === 'PLAYING').length;
  const totalTables = (tables || []).length;

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = (bookings || []).filter(b => 
    b.startTime.startsWith(today)
  ).length;

  const pendingBookings = (bookings || []).filter(b => b.status === 'PENDING').length;
  const confirmedBookings = (bookings || []).filter(b => b.status === 'CONFIRMED').length;

  const openOrders = (orders || []).filter(o => o.status === 'OPEN').length;
  const totalOrderRevenue = (orders || [])
    .filter(o => o.status === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  // Recent activities
  const recentBookings = (bookings || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentPayments = (payments || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Overview of your billiard business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalRevenue.toLocaleString()}đ
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              From {(payments || []).filter(p => p.status === 'PAID').length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Tables
            </CardTitle>
            <Square className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeTables} / {totalTables}
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              {totalTables > 0 ? Math.round((activeTables / totalTables) * 100) : 0}% occupied
            </p>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Today's Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{todayBookings}</div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              {pendingBookings} pending, {confirmedBookings} confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Open Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{openOrders}</div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Revenue: {totalOrderRevenue.toLocaleString()}đ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Status Overview */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Tables Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {(tables || []).filter(t => t.status === 'IDLE').length}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Ready to use</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                {(tables || []).filter(t => t.status === 'PLAYING').length}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Playing</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Currently in use</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {(tables || []).filter(t => t.status === 'RESERVED').length}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reserved</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Booked in advance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {booking.table?.code || `Table ${booking.tableId.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(booking.startTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        booking.status === 'CONFIRMED' ? 'default' : 
                        booking.status === 'PENDING' ? 'secondary' : 
                        booking.status === 'COMPLETED' ? 'outline' : 
                        'destructive'
                      }>
                        {booking.status}
                      </Badge>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {booking.totalPrice.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        Payment #{payment.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(payment.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        payment.status === 'PAID' ? 'default' : 
                        payment.status === 'PENDING' ? 'secondary' : 
                        'destructive'
                      }>
                        {payment.method}
                      </Badge>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                        {payment.total.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No payments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {(bookings || []).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Bookings</div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {(orders || []).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Orders</div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {(payments || []).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Payments</div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {totalTables}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Tables</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
