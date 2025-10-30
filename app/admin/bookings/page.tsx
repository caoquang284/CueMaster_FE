"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { BookingStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function BookingsPage() {
  const { bookings, tables, updateBooking, addBooking, addNotification } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    tableId: '',
    startTime: '',
    endTime: '',
  });

  const handleCreateBooking = () => {
    if (!formData.customerName || !formData.tableId || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    const selectedTable = tables.find(t => t.id === formData.tableId);
    if (!selectedTable) return;

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalPrice = hours * selectedTable.pricePerHour;

    addBooking({
      customerId: 'c' + Math.random().toString(36).substr(2, 9),
      customerName: formData.customerName,
      tableId: formData.tableId,
      tableName: selectedTable.name,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: 'pending',
      totalPrice,
    });

    addNotification({
      title: 'New Booking Created',
      message: `${formData.customerName} booked ${selectedTable.name}`,
      type: 'info',
      read: false,
    });

    toast({
      title: 'Success',
      description: 'Booking created successfully',
    });

    setFormData({
      customerName: '',
      tableId: '',
      startTime: '',
      endTime: '',
    });
    setIsDialogOpen(false);
  };

  const handleConfirmBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'confirmed' });
    toast({
      title: 'Success',
      description: 'Booking confirmed',
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'cancelled' });
    toast({
      title: 'Cancelled',
      description: 'Booking has been cancelled',
    });
  };

  const statusColors: Record<BookingStatus, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    ongoing: 'bg-emerald-500',
    completed: 'bg-slate-500',
    cancelled: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bookings</h1>
          <p className="text-slate-400">Manage customer bookings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="John Doe"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Table</Label>
                <Select value={formData.tableId} onValueChange={(value) => setFormData({ ...formData, tableId: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {tables.filter(t => t.status === 'available').map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.name} - {table.type} ({table.pricePerHour.toLocaleString()}đ/h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                Cancel
              </Button>
              <Button onClick={handleCreateBooking} className="bg-emerald-600 hover:bg-emerald-700">
                Create Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Table</TableHead>
                <TableHead className="text-slate-400">Start Time</TableHead>
                <TableHead className="text-slate-400">End Time</TableHead>
                <TableHead className="text-slate-400">Total</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-white font-medium">{booking.customerName}</TableCell>
                  <TableCell className="text-slate-300">{booking.tableName}</TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(booking.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(booking.endTime).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {booking.totalPrice.toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${statusColors[booking.status]} text-white border-0 capitalize`}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
