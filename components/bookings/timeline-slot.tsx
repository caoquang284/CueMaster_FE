'use client';

import { TimelineBooking } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TimelineSlotProps {
  hour: string; // e.g., "09:00"
  tableId: string;
  booking?: TimelineBooking;
  onClick: () => void;
}

export function TimelineSlot({ hour, tableId, booking, onClick }: TimelineSlotProps) {
  if (!booking) {
    // Empty slot - available for booking
    return (
      <div
        className={cn(
          "min-h-[60px] border border-slate-200 dark:border-slate-700",
          "bg-slate-50 dark:bg-slate-800/50",
          "hover:bg-blue-50 dark:hover:bg-blue-900/20",
          "cursor-pointer transition-colors",
          "flex items-center justify-center text-slate-400 text-xs"
        )}
        onClick={onClick}
      >
        <span className="opacity-0 group-hover:opacity-100">+</span>
      </div>
    );
  }

  // Check if booking spans this hour
  const bookingStart = new Date(booking.startTime);
  const bookingEnd = new Date(booking.endTime);
  const currentHour = parseInt(hour.split(':')[0]);
  const startHour = bookingStart.getHours();
  const endHour = bookingEnd.getHours();

  // This slot hour is not in booking range
  if (currentHour < startHour || currentHour >= endHour) {
    return (
      <div
        className={cn(
          "min-h-[60px] border border-slate-200 dark:border-slate-700",
          "bg-slate-50 dark:bg-slate-800/50",
          "hover:bg-blue-50 dark:hover:bg-blue-900/20",
          "cursor-pointer transition-colors",
          "flex items-center justify-center text-slate-400 text-xs"
        )}
        onClick={onClick}
      >
        <span className="opacity-0 group-hover:opacity-100">+</span>
      </div>
    );
  }

  // Determine color based on status
  const statusColors = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    CONFIRMED: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    COMPLETED: 'bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700',
  };

  const bgColor = statusColors[booking.status as keyof typeof statusColors] || statusColors.PENDING;

  // Only show full info on the first slot
  const isFirstSlot = currentHour === startHour;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "min-h-[60px] border-2",
              bgColor,
              "p-2 cursor-pointer transition-all hover:shadow-md",
              "flex flex-col justify-center"
            )}
          >
            {isFirstSlot && (
              <>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {booking.customerName}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  {bookingStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {bookingEnd.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Badge 
                  variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} 
                  className="text-[10px] w-fit mt-1"
                >
                  {booking.status}
                </Badge>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{booking.customerName}</p>
            <p className="text-xs">
              {bookingStart.toLocaleString('vi-VN')} - {bookingEnd.toLocaleString('vi-VN')}
            </p>
            <p className="text-xs">Giá: {booking.totalPrice.toLocaleString()}đ</p>
            {booking.isGuest && (
              <div className="text-xs text-slate-500 border-t pt-1 mt-1">
                <p>📧 {booking.guestEmail}</p>
                <p>📱 {booking.guestPhone}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
