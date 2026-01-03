"use client";

import { useState } from 'react';
import { usePayments } from '@/lib/hooks/use-payments';
import { useOrders } from '@/lib/hooks/use-orders';
import { paymentsApi } from '@/lib/api/payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, DollarSign } from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';

export default function PaymentsPage() {
  const { payments, isLoading, isError, mutate } = usePayments();
  const { orders } = useOrders({ status: 'OPEN' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    orderId: '',
    tableCost: '',
    orderCost: '',
    method: 'CASH' as PaymentMethod,
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load payments</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleCreatePayment = async () => {
    if (!formData.orderId || !formData.tableCost || !formData.orderCost) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    try {
      await paymentsApi.create({
        orderId: formData.orderId,
        tableCost: parseInt(formData.tableCost),
        orderCost: parseInt(formData.orderCost),
        method: formData.method,
      });

      await mutate();
      toast({ title: 'Success', description: 'Payment created successfully' });
      setIsDialogOpen(false);
      setFormData({ orderId: '', tableCost: '', orderCost: '', method: 'CASH' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const config = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      PAID: { variant: 'default' as const, label: 'Paid' },
      FAILED: { variant: 'destructive' as const, label: 'Failed' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getMethodBadge = (method: PaymentMethod) => {
    const config = {
      CASH: { variant: 'outline' as const, label: 'Cash' },
      MOMO: { variant: 'secondary' as const, label: 'MoMo' },
    };
    return <Badge variant={config[method].variant}>{config[method].label}</Badge>;
  };

  const totalRevenue = (payments || [])
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Payments</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage payments and transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order</Label>
                <Select value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orders || []).map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        Order #{order.id.slice(0, 8)} - Table {order.table?.code} - {order.total.toLocaleString()}đ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableCost">Table Cost (VND)</Label>
                <Input
                  id="tableCost"
                  type="number"
                  value={formData.tableCost}
                  onChange={(e) => setFormData({ ...formData, tableCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderCost">Order Cost (VND)</Label>
                <Input
                  id="orderCost"
                  type="number"
                  value={formData.orderCost}
                  onChange={(e) => setFormData({ ...formData, orderCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="text-2xl font-bold text-blue-600">
                  {(parseInt(formData.tableCost || '0') + parseInt(formData.orderCost || '0')).toLocaleString()}đ
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={formData.method} onValueChange={(value: PaymentMethod) => setFormData({ ...formData, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="MOMO">MoMo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePayment}>Create Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Table Cost</TableHead>
                <TableHead>Order Cost</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments || []).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs">{payment.orderId.slice(0, 8)}...</TableCell>
                  <TableCell>{payment.tableCost.toLocaleString()}đ</TableCell>
                  <TableCell>{payment.orderCost.toLocaleString()}đ</TableCell>
                  <TableCell className="font-semibold">{payment.total.toLocaleString()}đ</TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(payment.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!payments || payments.length === 0) && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No payments found
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {totalRevenue.toLocaleString()}đ
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(payments || []).filter(p => p.status === 'PAID').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Paid</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-500 mb-1">
              {(payments || []).filter(p => p.status === 'PENDING').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-500 mb-1">
              {(payments || []).filter(p => p.method === 'CASH').length}/{(payments || []).filter(p => p.method === 'MOMO').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Cash/MoMo</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
