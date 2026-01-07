'use client';

import { useState } from 'react';
import { TimelineTable, TimelineBooking } from '@/lib/types';
import { TimelineSlot } from './timeline-slot';
import { QuickBookingDialog } from './quick-booking-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimelineViewProps {
  tables: TimelineTable[];
  timeSlots: string[];
  selectedDate: string;
  onRefresh?: () => void;
}

export function TimelineView({ tables, timeSlots, selectedDate, onRefresh }: TimelineViewProps) {
  const [bookingDialog, setBookingDialog] = useState<{
    open: boolean;
    tableId: string;
    tableCode: string;
    tablePriceHour: number;
    selectedHour: string;
  } | null>(null);

  const handleSlotClick = (table: TimelineTable, hour: string, booking?: TimelineBooking) => {
    if (booking) {
      // Already booked - could show details or do nothing
      return;
    }

    // Open booking dialog for empty slot
    setBookingDialog({
      open: true,
      tableId: table.id,
      tableCode: table.code,
      tablePriceHour: table.priceHour,
      selectedHour: hour,
    });
  };

  const findBookingForSlot = (tableBookings: TimelineBooking[], hour: string) => {
    const currentHour = parseInt(hour.split(':')[0]);
    
    return tableBookings.find((booking) => {
      const startHour = new Date(booking.startTime).getHours();
      const endHour = new Date(booking.endTime).getHours();
      return currentHour >= startHour && currentHour < endHour;
    });
  };

  return (
    <>
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[1000px]">
              {/* Header with time slots */}
              <div className="grid grid-cols-[200px_repeat(16,1fr)] border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 sticky top-0 z-10">
                <div className="p-4 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                  Bàn / Giờ
                </div>
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="p-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700"
                  >
                    {slot}
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="grid grid-cols-[200px_repeat(16,1fr)] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Table info column */}
                  <div className="p-4 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {table.code}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {table.type}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {table.priceHour.toLocaleString()}đ/h
                    </div>
                    <Badge
                      variant={table.status === 'IDLE' ? 'outline' : 'default'}
                      className="text-[10px] w-fit mt-2"
                    >
                      {table.status}
                    </Badge>
                  </div>

                  {/* Time slots */}
                  {timeSlots.map((slot) => {
                    const booking = findBookingForSlot(table.bookings, slot);
                    return (
                      <div key={`${table.id}-${slot}`} className="border-r border-slate-200 dark:border-slate-700">
                        <TimelineSlot
                          hour={slot}
                          tableId={table.id}
                          booking={booking}
                          onClick={() => handleSlotClick(table, slot, booking)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}

              {tables.length === 0 && (
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  Không có bàn nào
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      {bookingDialog && (
        <QuickBookingDialog
          open={bookingDialog.open}
          onOpenChange={(open) => {
            if (!open) setBookingDialog(null);
          }}
          tableId={bookingDialog.tableId}
          tableCode={bookingDialog.tableCode}
          tablePriceHour={bookingDialog.tablePriceHour}
          selectedDate={selectedDate}
          selectedHour={bookingDialog.selectedHour}
          onSuccess={() => {
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}
