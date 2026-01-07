'use client';

import { TimelineTable, TimelineBooking } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

interface GanttTimelineViewProps {
  tables: TimelineTable[];
  selectedDate: string;
  onSlotClick: (tableId: string, startHour: number, startMinute: number) => void;
  showPersonalInfo?: boolean; // If false, hide customer names and contact info
}

export function GanttTimelineView({ tables, selectedDate, onSlotClick, showPersonalInfo = false }: GanttTimelineViewProps) {
  // Generate hours array (0-23)
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  
  // Fixed width for each hour cell to ensure precise alignment
  const HOUR_WIDTH = 80; // pixels
  const TOTAL_WIDTH = HOUR_WIDTH * 24; // 1920px

  // Current time indicator - updates every minute
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update current time every 30 seconds for smooth realtime indicator
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Calculate position of current time indicator
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const totalDayMinutes = 24 * 60;
    const positionPercent = (currentTotalMinutes / totalDayMinutes) * 100;
    return positionPercent;
  };

  // Check if current time indicator should be shown (only for today)
  const shouldShowCurrentTime = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  }, [selectedDate]);

  // Calculate position and width for a booking on the timeline
  const getBookingStyle = (booking: TimelineBooking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    
    // Get the selected date at midnight for comparison
    const selectedDateMidnight = new Date(selectedDate + 'T00:00:00');
    const nextDayMidnight = new Date(selectedDateMidnight);
    nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);
    
    // IMPORTANT: Use getHours() and getMinutes() which automatically handles local timezone
    let startHour = start.getHours();
    let startMinute = start.getMinutes();
    let endHour = end.getHours();
    let endMinute = end.getMinutes();
    
    // Handle booking that starts before this day (from previous day)
    if (start < selectedDateMidnight) {
      startHour = 0;
      startMinute = 0;
    }
    
    // Handle booking that ends after this day (continues to next day)
    if (end >= nextDayMidnight) {
      endHour = 23;
      endMinute = 59;
    }
    
    // Calculate total minutes from start of day
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Calculate position as percentage (0-100%)
    const totalDayMinutes = 24 * 60;
    const startPercent = (startTotalMinutes / totalDayMinutes) * 100;
    const endPercent = (endTotalMinutes / totalDayMinutes) * 100;
    const widthPercent = endPercent - startPercent;
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Get color for booking status
  const getBookingColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-400/80 border-yellow-500 dark:bg-yellow-500/60',
      CONFIRMED: 'bg-green-400/80 border-green-500 dark:bg-green-500/60',
      CANCELLED: 'bg-red-400/80 border-red-500 dark:bg-red-500/60',
      COMPLETED: 'bg-slate-400/80 border-slate-500 dark:bg-slate-500/60',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Get display text for booking based on status (for public view)
  const getPublicBookingText = (status: string) => {
    const statusText = {
      PENDING: 'Đang đặt',
      CONFIRMED: 'Đã đặt',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
    };
    return statusText[status as keyof typeof statusText] || 'Đã đặt';
  };

  // Handle click on timeline (empty space)
  const handleTimelineClick = (tableId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentClicked = (x / rect.width) * 100;
    
    // Convert percent to time
    const totalMinutes = (percentClicked / 100) * (24 * 60);
    const hour = Math.floor(totalMinutes / 60);
    const minute = Math.floor(totalMinutes % 60);
    
    // Round to nearest 15 minutes for better UX
    const roundedMinute = Math.round(minute / 15) * 15;
    const finalMinute = roundedMinute === 60 ? 0 : roundedMinute;
    const finalHour = roundedMinute === 60 ? hour + 1 : hour;
    
    if (finalHour < 24) {
      onSlotClick(tableId, finalHour, finalMinute);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Container with synchronized horizontal scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <div style={{ width: TOTAL_WIDTH + 160 }}>  {/* Total width + table column (160px = 40*4) */}
          {/* Timeline Header - Hours (Sticky top) */}
          <div className="sticky top-0 z-30 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex">
              {/* Table column header - Sticky left */}
              <div className="w-40 flex-shrink-0 p-3 border-r border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 sticky left-0 z-40">
                Bàn
              </div>
              
              {/* Hours timeline */}
              <div className="relative" style={{ width: TOTAL_WIDTH }}>
                <div className="flex h-12">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-r border-slate-300 dark:border-slate-700 px-2 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-300 flex-shrink-0"
                      style={{ width: HOUR_WIDTH }}
                    >
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Current Time Indicator Label (on header) */}
                {shouldShowCurrentTime && (
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none z-50"
                    style={{ left: `${getCurrentTimePosition()}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[11px] px-2 py-1 rounded whitespace-nowrap font-semibold shadow-lg">
                      {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-red-500"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tables with Gantt bars */}
          <div className="relative">
            {/* Current Time Indicator - Single continuous red line through all rows */}
            {shouldShowCurrentTime && (
              <>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 pointer-events-none"
                  style={{ 
                    left: `calc(160px + ${(getCurrentTimePosition() / 100) * TOTAL_WIDTH}px)`,
                    boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
                  }}
                />
                {/* Floating time badge on top of the line - vertical orientation */}
                <div
                  className="absolute -top-2 z-50 pointer-events-none"
                  style={{ 
                    left: `calc(160px + ${(getCurrentTimePosition() / 100) * TOTAL_WIDTH}px)`,
                  }}
                >
                  <div className="relative left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="bg-red-500 text-white px-1 py-1 rounded shadow-lg border border-white flex flex-col items-center gap-0.5">
                      <span className="text-xs">🕐</span>
                      <span className="text-[10px] font-bold leading-none">
                        {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tables.map((table) => (
              <div
                key={table.id}
                className="flex border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Table info column - Sticky left */}
                <div className="w-40 flex-shrink-0 py-2 px-3 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky left-0 z-20">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {table.code}
                    </span>
                    <Badge
                      variant={table.status === 'IDLE' ? 'outline' : 'default'}
                      className="text-[9px] px-1 py-0 h-4"
                    >
                      {table.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {table.type}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {table.priceHour.toLocaleString()}đ/h
                  </div>
                </div>

                {/* Gantt timeline area */}
                <div className="relative h-16" style={{ width: TOTAL_WIDTH }}>
                  {/* Hour markers (background grid) */}
                  <div className="absolute inset-0 flex">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-r border-slate-200 dark:border-slate-700 flex-shrink-0"
                        style={{ width: HOUR_WIDTH }}
                      />
                    ))}
                  </div>

                  {/* Clickable area for creating bookings */}
                  <div
                    className="absolute inset-0 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                    onClick={(e) => handleTimelineClick(table.id, e)}
                    title="Click để đặt bàn"
                  />

                  {/* Booking bars (Gantt style) */}
                  {table.bookings.map((booking) => {
                    const style = getBookingStyle(booking);
                    const colorClass = getBookingColor(booking.status);
                    
                    return (
                      <TooltipProvider key={booking.id} delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'absolute top-2 bottom-2 rounded border-2 shadow-sm hover:shadow-md transition-all cursor-pointer z-10',
                                colorClass,
                                'flex items-center justify-center overflow-hidden'
                              )}
                              style={style}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Could open booking detail dialog
                              }}
                            >
                              <div className="px-2 text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {showPersonalInfo ? booking.customerName : getPublicBookingText(booking.status)}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              {showPersonalInfo && (
                                <p className="font-semibold">{booking.customerName}</p>
                              )}
                              <p className="text-xs">
                                {formatTime(new Date(booking.startTime))} - {formatTime(new Date(booking.endTime))}
                              </p>
                              <p className="text-xs">
                                Giá: {booking.totalPrice.toLocaleString()}đ
                              </p>
                              <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px]">
                                {booking.status}
                              </Badge>
                              {showPersonalInfo && booking.isGuest && (
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
                  })}
                </div>
              </div>
            ))}

            {tables.length === 0 && (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                Không có bàn nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
