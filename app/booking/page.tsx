'use client';

import { useState } from 'react';
import { useBookingTimeline } from '@/lib/hooks/use-bookings';
import { TimelineView } from '@/components/bookings/timeline-view';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { CalendarIcon, RefreshCw, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PublicBookingPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { timeline, isLoading, isError, mutate } = useBookingTimeline(selectedDate);

  const handleDateChange = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Không thể tải dữ liệu</p>
          <Button onClick={() => mutate()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const displayDate = new Date(selectedDate + 'T00:00:00');
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🎱 Đặt bàn bi-a CueMaster</h1>
          <p className="text-emerald-50 text-lg">
            Xem lịch trống và đặt bàn ngay - Không cần đăng nhập
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="space-y-6">
          {/* Info Alert */}
          <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
              Hướng dẫn đặt bàn
            </AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200 mt-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Chọn ngày bạn muốn đặt bàn</li>
                <li>Click vào ô trống (màu xám) để mở form đặt bàn</li>
                <li>Nhập thông tin và xác nhận đặt bàn</li>
                <li>Kiểm tra email để nhận thông tin xác nhận</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Date Selector */}
          <Card className="dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange(-1)}
                  className="dark:border-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3 flex-1 justify-center">
                  <CalendarIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto max-w-[200px] dark:border-slate-600 dark:bg-slate-700"
                  />
                  {isToday && (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full">
                      Hôm nay
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange(1)}
                  className="dark:border-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {displayDate.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutate()}
                  className="dark:border-slate-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="dark:border-slate-700 dark:bg-slate-800/50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {timeline?.tables.length || 0}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Tổng số bàn
                </p>
              </CardContent>
            </Card>

            <Card className="dark:border-slate-700 dark:bg-slate-800/50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {timeline?.timeSlots.length || 0}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Khung giờ
                </p>
              </CardContent>
            </Card>

            <Card className="dark:border-slate-700 dark:bg-slate-800/50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {timeline?.tables.reduce((acc, t) => acc + t.bookings.length, 0) || 0}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Đã đặt
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card className="dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center justify-center text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Chú thích:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"></div>
                  <span className="text-slate-600 dark:text-slate-400">Trống (có thể đặt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded"></div>
                  <span className="text-slate-600 dark:text-slate-400">Chờ xác nhận</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded"></div>
                  <span className="text-slate-600 dark:text-slate-400">Đã xác nhận</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {timeline && (
            <TimelineView
              tables={timeline.tables}
              timeSlots={timeline.timeSlots}
              selectedDate={selectedDate}
              onRefresh={() => mutate()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
