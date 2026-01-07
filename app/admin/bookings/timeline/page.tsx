'use client';

import { useState } from 'react';
import { useBookingTimeline } from '@/lib/hooks/use-bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { GanttTimelineView } from '@/components/bookings/gantt-timeline-view';
import { PreciseBookingDialog } from '@/components/bookings/precise-booking-dialog';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TimelineBookingPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const { timeline, isLoading, isError, mutate } = useBookingTimeline(selectedDate);

  // Dialog state for precise booking
  const [preciseBookingDialog, setPreciseBookingDialog] = useState({
    open: false,
    tableId: '',
    tableCode: '',
    tablePriceHour: 0,
    initialHour: 0,
    initialMinute: 0,
  });

  const handleDateChange = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Không thể tải dữ liệu timeline</p>
          <Button onClick={() => mutate()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const displayDate = new Date(selectedDate + 'T00:00:00');
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📅 Lịch đặt bàn theo giờ
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Xem tình trạng bàn và đặt bàn nhanh
          </p>
        </div>

        <Button onClick={() => mutate()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Date Selector */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3 flex-1 justify-center">
              <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto max-w-[200px]"
              />
              {isToday && (
                <Badge variant="default">Hôm nay</Badge>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {displayDate.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Chú thích:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Đang chờ (PENDING)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-400 border-2 border-green-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Đã xác nhận (CONFIRMED)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-400 border-2 border-red-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Đã hủy (CANCELLED)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-400 border-2 border-slate-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Hoàn thành (COMPLETED)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Timeline Chart */}
      <Card className="dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">
            Timeline Gantt - {timeline?.tables.length || 0} bàn
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {timeline ? (
            <GanttTimelineView
              tables={timeline.tables}
              selectedDate={selectedDate}
              showPersonalInfo={true}
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
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

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
          await mutate();
        }}
      />
    </div>
  );
}
