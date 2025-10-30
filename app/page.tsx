"use client";

import { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTables, mockMenuItems, mockBookings } from '@/lib/mock-data';
import { CalendarDays, Clock, CircleDot, Sparkles, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [realtimeUpdate, setRealtimeUpdate] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { toast } = useToast();

  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    tableType: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeUpdate(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const availableTables = mockTables.filter(t => t.status === 'available');

  const handleBooking = () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.tableType || !bookingForm.date || !bookingForm.time) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Booking Confirmed!',
      description: 'Your table has been reserved successfully',
    });

    setBookingForm({
      name: '',
      phone: '',
      tableType: '',
      date: '',
      time: '',
    });
    setIsBookingOpen(false);
  };

  const statusColors = {
    available: 'bg-emerald-500',
    occupied: 'bg-orange-500',
    reserved: 'bg-blue-500',
    maintenance: 'bg-slate-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <PublicHeader />

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium Billiard Experience
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight dark:text-white">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                CueMaster
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto dark:text-slate-300">
              Experience world-class billiard facilities with professional equipment, comfortable environment, and exceptional service
            </p>
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-6 text-lg">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Book a Table Now
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                <DialogHeader>
                  <DialogTitle>Reserve Your Table</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="dark:border-slate-700 dark:bg-slate-800"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="dark:border-slate-700 dark:bg-slate-800"
                      placeholder="+84 123 456 789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Table Type</Label>
                    <Select value={bookingForm.tableType} onValueChange={(value) => setBookingForm({ ...bookingForm, tableType: value })}>
                      <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                        <SelectValue placeholder="Select table type" />
                      </SelectTrigger>
                      <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                        <SelectItem value="Pool">Pool Table</SelectItem>
                        <SelectItem value="Snooker">Snooker Table</SelectItem>
                        <SelectItem value="Carom">Carom Table</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsBookingOpen(false)}
                    className="border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleBooking} className="bg-emerald-600 hover:bg-emerald-700">
                    Confirm Booking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section id="tables" className="py-16 bg-slate-100 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">Available Tables</h2>
            <p className="text-slate-600 dark:text-slate-400">Real-time table availability - updates every 5 seconds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {mockTables.map((table) => (
              <Card
                key={`${table.id}-${realtimeUpdate}`}
                className={cn(
                  'border-2 transition-all duration-500 hover:scale-105',
                  table.status === 'available' && 'border-emerald-500/30 bg-emerald-500/5',
                  table.status === 'occupied' && 'border-orange-500/30 bg-orange-500/5',
                  table.status === 'reserved' && 'border-blue-500/30 bg-blue-500/5',
                  table.status === 'maintenance' && 'border-slate-500/30 bg-slate-500/5'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{table.name}</h3>
                    <div className={cn('h-3 w-3 rounded-full', statusColors[table.status])} />
                  </div>
                  <div className="text-sm text-slate-600 mb-2 dark:text-slate-400">{table.type}</div>
                  <div className="text-lg font-bold text-emerald-500">
                    {table.pricePerHour.toLocaleString()}đ/h
                  </div>
                  <div className="text-xs text-slate-500 mt-2 capitalize dark:text-slate-400">
                    {table.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Available ({availableTables.length})</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Occupied</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Reserved</span>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">Food & Beverages</h2>
            <p className="text-slate-600 dark:text-slate-400">Enjoy delicious food and drinks while you play</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockMenuItems.slice(0, 8).map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden transition-all duration-300 hover:border-emerald-500/30 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-emerald-500">
                    {item.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2 dark:text-slate-400">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-emerald-500">
                      {item.price.toLocaleString()}đ
                    </span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="bookings" className="py-16 bg-slate-100 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">My Bookings</h2>
            <p className="text-slate-600 dark:text-slate-400">Track your upcoming reservations</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {mockBookings.filter(b => b.customerId === 'c1' || b.customerId === 'c2').map((booking) => (
              <Card key={booking.id} className="dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="bg-emerald-500/10 p-4 rounded-lg">
                        <CircleDot className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg mb-1 dark:text-white">{booking.tableName}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(booking.startTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900 mb-1 dark:text-white">
                        {booking.totalPrice.toLocaleString()}đ
                      </div>
                      <Badge className={cn(
                        booking.status === 'confirmed' && 'bg-blue-500',
                        booking.status === 'ongoing' && 'bg-emerald-500',
                        booking.status === 'completed' && 'bg-slate-500'
                      )}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
