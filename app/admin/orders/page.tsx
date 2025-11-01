"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function OrdersPage() {
  const { orders, bookings, menuItems, addOrder, closeOrder, addPayment } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{ menuItemId: string; quantity: number }>>([]);
  const { toast } = useToast();

  const activeBookings = bookings.filter(b => b.status === 'ongoing' || b.status === 'confirmed');

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
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return sum + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const handleCreateOrder = () => {
    if (!selectedBooking || orderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a booking and add items',
        variant: 'destructive',
      });
      return;
    }

    const booking = bookings.find(b => b.id === selectedBooking);
    if (!booking) return;

    const items = orderItems.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem?.name || '',
        quantity: item.quantity,
        price: menuItem?.price || 0,
      };
    });

    addOrder({
      bookingId: booking.id,
      tableId: booking.tableId,
      tableName: booking.tableName,
      items,
      totalPrice: calculateTotal(),
      status: 'open',
    });

    toast({
      title: 'Success',
      description: 'Order created successfully',
    });

    setSelectedBooking('');
    setOrderItems([]);
    setIsDialogOpen(false);
  };

  const handleCloseOrder = (order: any) => {
    closeOrder(order.id);

    addPayment({
      orderId: order.id,
      bookingId: order.bookingId,
      tableId: order.tableId,
      tableName: order.tableName,
      totalAmount: order.totalPrice,
      method: 'cash',
      status: 'pending',
    });

    toast({
      title: 'Order Closed',
      description: 'Payment created. Please process payment.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage customer orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Booking</Label>
                <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                  <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                    {activeBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.tableName} - {booking.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddOrderItem}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={item.menuItemId}
                        onValueChange={(value) => handleUpdateOrderItem(index, 'menuItemId', value)}
                      >
                        <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                          {menuItems.map((menuItem) => (
                            <SelectItem key={menuItem.id} value={menuItem.id}>
                              {menuItem.name} - {menuItem.price.toLocaleString()}đ
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateOrderItem(index, 'quantity', parseInt(e.target.value))}
                        className="dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveOrderItem(index)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {orderItems.length === 0 && (
                  <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No items added yet
                  </div>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="text-2xl font-bold text-emerald-500">
                      {calculateTotal().toLocaleString()}đ
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateOrder} className="bg-emerald-600 hover:bg-emerald-700">
                Create Order
              </Button>
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
              <TableRow className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <TableHead className="text-slate-600 dark:text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Table</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Items</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Total</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Time</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="font-mono text-sm text-slate-900 dark:text-white">
                    #{order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{order.tableName}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="text-xs">
                          {item.quantity}x {item.menuItemName}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {order.totalPrice.toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.status === 'open' ? 'default' : 'secondary'}
                      className={order.status === 'open' ? 'bg-emerald-500' : 'bg-slate-500'}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {order.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => handleCloseOrder(order)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Close Order
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <div className="py-12 text-center text-slate-600 dark:text-slate-400">
              No orders yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
