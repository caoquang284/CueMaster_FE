"use client";

import { useState } from 'react';
import { useOrders } from '@/lib/hooks/use-orders';
import { useTables } from '@/lib/hooks/use-tables';
import { useMenu } from '@/lib/hooks/use-menu';
import { ordersApi } from '@/lib/api/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X, Minus, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { OrderStatus } from '@/lib/types';

export default function OrdersPage() {
  const { orders, isLoading, isError, mutate } = useOrders({});
  const { tables } = useTables();
  const { menuItems } = useMenu();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{ menuItemId: string; quantity: number }>>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { toast } = useToast();

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load orders</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { menuItemId: '', quantity: 1 }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateOrderItem = (index: number, field: 'menuItemId' | 'quantity', value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const menuItem = (menuItems || []).find(m => m.id === item.menuItemId);
      return sum + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedTableId || orderItems.length === 0) {
      toast({ title: 'Error', description: 'Please select a table and add items', variant: 'destructive' });
      return;
    }

    const validItems = orderItems.filter(item => item.menuItemId && item.quantity > 0);
    if (validItems.length === 0) {
      toast({ title: 'Error', description: 'Please add valid items', variant: 'destructive' });
      return;
    }

    try {
      await ordersApi.create({ tableId: selectedTableId });
      const newOrder = (await ordersApi.getAll({ tableId: selectedTableId }))[0];
      
      for (const item of validItems) {
        await ordersApi.addItem(newOrder.id, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        });
      }

      await mutate();
      toast({ title: 'Success', description: 'Order created successfully' });
      setIsDialogOpen(false);
      setSelectedTableId('');
      setOrderItems([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleCloseOrder = async (id: string) => {
    if (!confirm('Are you sure you want to close this order?')) return;

    try {
      setActioningId(id);
      await ordersApi.close(id);
      await mutate();
      toast({ title: 'Success', description: 'Order closed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      OPEN: { variant: 'default' as const, label: 'Open' },
      PAID: { variant: 'secondary' as const, label: 'Paid' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage table orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableId">Table</Label>
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tables || []).filter(t => t.status === 'PLAYING').map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.code} - {table.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button size="sm" variant="outline" onClick={handleAddOrderItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        value={item.menuItemId}
                        onValueChange={(value) => handleUpdateOrderItem(index, 'menuItemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {(menuItems || []).filter(m => m.isAvailable).map((menuItem) => (
                            <SelectItem key={menuItem.id} value={menuItem.id}>
                              {menuItem.name} - {menuItem.price.toLocaleString()}đ
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateOrderItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveOrderItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {orderItems.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{calculateTotal().toLocaleString()}đ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateOrder}>Create Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders || []).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{order.table?.code || order.tableId}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.length || 0} items
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{order.total.toLocaleString()}đ</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {order.status === 'OPEN' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCloseOrder(order.id)}
                        disabled={actioningId === order.id}
                      >
                        Close
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!orders || orders.length === 0) && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {(orders || []).filter(o => o.status === 'OPEN').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Open Orders</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(orders || []).filter(o => o.status === 'PAID').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Paid</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {(orders || []).reduce((sum, o) => sum + o.total, 0).toLocaleString()}đ
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
