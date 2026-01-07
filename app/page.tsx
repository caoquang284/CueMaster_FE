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
import { CalendarDays, Clock, CircleDot, Sparkles, UtensilsCrossed, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { tablesApi, menuApi, bookingsApi } from '@/lib/api';
import type { CreatePublicBookingDto } from '@/lib/api/bookings';
import { Table, MenuItem, Booking } from '@/lib/types';
import { useBookingTimeline } from '@/lib/hooks/use-bookings';
import { GanttTimelineView } from '@/components/bookings/gantt-timeline-view';
import { PreciseBookingDialog } from '@/components/bookings/precise-booking-dialog';

export default function Home() {
  const [realtimeUpdate, setRealtimeUpdate] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Real API data states
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Timeline state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const { timeline, isLoading: timelineLoading, mutate: mutateTimeline } = useBookingTimeline(selectedDate);

  // Precise booking dialog state
  const [preciseBookingDialog, setPreciseBookingDialog] = useState({
    open: false,
    tableId: '',
    tableCode: '',
    tablePriceHour: 0,
    initialHour: 0,
    initialMinute: 0,
  });

  const [bookingForm, setBookingForm] = useState({
    selectedTableId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    startDate: '',
    startTime: '',
    durationHours: '2',
  });

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tablesData, menuData] = await Promise.all([
          tablesApi.getAll(),
          menuApi.getAll(),
        ]);
        setTables(tablesData);
        setMenuItems(menuData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeUpdate(prev => prev + 1);
      // Refetch tables for real-time status
      tablesApi.getAll().then(setTables).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const availableTables = tables.filter(t => t.status === 'IDLE');

  const handleBooking = async () => {
    if (!bookingForm.selectedTableId || !bookingForm.guestName || !bookingForm.guestEmail || 
        !bookingForm.guestPhone || !bookingForm.startDate || !bookingForm.startTime) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time into ISO string
      const startDateTime = new Date(`${bookingForm.startDate}T${bookingForm.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(bookingForm.durationHours) * 60 * 60 * 1000);

      const bookingData: CreatePublicBookingDto = {
        tableId: bookingForm.selectedTableId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        guestName: bookingForm.guestName,
        guestEmail: bookingForm.guestEmail,
        guestPhone: bookingForm.guestPhone,
      };

      await bookingsApi.createPublic(bookingData);

      toast({
        title: 'Booking Confirmed!',
        description: 'Your table has been reserved successfully. We will contact you shortly.',
      });

      // Reset form
      setBookingForm({
        selectedTableId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        startDate: '',
        startTime: '',
        durationHours: '2',
      });
      setIsBookingOpen(false);

      // Refresh tables
      tablesApi.getAll().then(setTables).catch(console.error);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedTable = () => {
    return tables.find(t => t.id === bookingForm.selectedTableId);
  };

  const calculateTotalPrice = () => {
    const table = getSelectedTable();
    if (!table) return 0;
    return table.priceHour * parseInt(bookingForm.durationHours || '0');
  };

  const statusColors = {
    IDLE: 'bg-emerald-500',
    PLAYING: 'bg-orange-500',
    RESERVED: 'bg-blue-500',
    MAINTENANCE: 'bg-slate-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <PublicHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-xl text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
        <PublicFooter />
      </div>
    );
  }

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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                <DialogHeader>
                  <DialogTitle>Reserve Your Table</DialogTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose an available table and fill in your details</p>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Table Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Select Available Table *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg dark:border-slate-700">
                      {availableTables.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-slate-500">
                          No tables available at the moment
                        </div>
                      ) : (
                        availableTables.map((table) => (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => setBookingForm({ ...bookingForm, selectedTableId: table.id })}
                            className={cn(
                              'p-4 border-2 rounded-lg text-left transition-all hover:scale-105',
                              bookingForm.selectedTableId === table.id
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                            )}
                          >
                            <div className="font-semibold text-sm">{table.code}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{table.type}</div>
                            <div className="text-xs font-medium text-emerald-600 mt-1">
                              {table.priceHour.toLocaleString('vi-VN')}đ/h
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={bookingForm.guestName}
                        onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={bookingForm.guestEmail}
                        onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={bookingForm.guestPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                      className="dark:border-slate-700 dark:bg-slate-800"
                      placeholder="+84 123 456 789"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={bookingForm.startDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Input
                        type="time"
                        value={bookingForm.startTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (hours) *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={bookingForm.durationHours}
                        onChange={(e) => setBookingForm({ ...bookingForm, durationHours: e.target.value })}
                        className="dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Price Summary */}
                  {bookingForm.selectedTableId && bookingForm.durationHours && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Estimated Total</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {getSelectedTable()?.code} × {bookingForm.durationHours}h
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {calculateTotalPrice().toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsBookingOpen(false)}
                    className="border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBooking} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
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
            {tables.map((table) => (
              <Card
                key={`${table.id}-${realtimeUpdate}`}
                className={cn(
                  'border-2 transition-all duration-500 hover:scale-105',
                  table.status === 'IDLE' && 'border-emerald-500/30 bg-emerald-500/5',
                  table.status === 'PLAYING' && 'border-orange-500/30 bg-orange-500/5',
                  table.status === 'RESERVED' && 'border-blue-500/30 bg-blue-500/5',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{table.code}</h3>
                    <div className={cn('h-3 w-3 rounded-full', statusColors[table.status])} />
                  </div>
                  <div className="text-sm text-slate-600 mb-2 dark:text-slate-400">{table.type}</div>
                  <div className="text-lg font-bold text-emerald-500">
                    {table.priceHour.toLocaleString()}đ/h
                  </div>
                  <div className="text-xs text-slate-500 mt-2 capitalize dark:text-slate-400">
                    {table.status.toLowerCase()}
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

      {/* TIMELINE BOOKING SECTION - NEW */}
      <section id="booking-timeline" className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">
              📅 Booking Timeline
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              View real-time booking schedule and reserve your table
            </p>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() - 1);
                setSelectedDate(current.toISOString().split('T')[0]);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto max-w-[200px]"
              />
              {selectedDate === new Date().toISOString().split('T')[0] && (
                <Badge variant="default">Hôm nay</Badge>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() + 1);
                setSelectedDate(current.toISOString().split('T')[0]);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => mutateTimeline()}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Timeline Grid */}
          {timelineLoading ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Loading timeline...
            </div>
          ) : timeline ? (
            <GanttTimelineView
              tables={timeline.tables}
              selectedDate={selectedDate}
              showPersonalInfo={false}
              onSlotClick={(tableId, hour, minute) => {
                const table = timeline.tables.find(t => t.id === tableId);
                if (table) {
                  setPreciseBookingDialog({
                    open: true,
                    tableId,
                    tableCode: table.code,
                    tablePriceHour: table.priceHour,
                    initialHour: hour,
                    initialMinute: minute,
                  });
                }
              }}
            />
          ) : (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No data available
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-2">
              <div className="w-6 h-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Trống</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Chờ xác nhận</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Đã xác nhận</span>
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
            {menuItems.slice(0, 8).map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden transition-all duration-300 hover:border-emerald-500/30 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-800">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <UtensilsCrossed className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
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
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={!item.isAvailable}>
                      {item.isAvailable ? 'Order' : 'Unavailable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Precise Booking Dialog */}
      <PreciseBookingDialog
        open={preciseBookingDialog.open}
        onOpenChange={(open) => setPreciseBookingDialog({ ...preciseBookingDialog, open })}
        tableId={preciseBookingDialog.tableId}
        tableCode={preciseBookingDialog.tableCode}
        tablePriceHour={preciseBookingDialog.tablePriceHour}
        selectedDate={selectedDate}
        initialHour={preciseBookingDialog.initialHour}
        initialMinute={preciseBookingDialog.initialMinute}
        onSuccess={async () => {
          await mutateTimeline();
        }}
      />
    </div>
  );
}
