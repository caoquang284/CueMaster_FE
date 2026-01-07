'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { bookingsApi } from '@/lib/api/bookings';

interface PreciseBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableCode: string;
  tablePriceHour: number;
  selectedDate: string;
  initialHour: number;
  initialMinute: number;
  onSuccess?: () => void;
}

export function PreciseBookingDialog({
  open,
  onOpenChange,
  tableId,
  tableCode,
  tablePriceHour,
  selectedDate,
  initialHour,
  initialMinute,
  onSuccess,
}: PreciseBookingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with clicked time
  const initialTime = `${initialHour.toString().padStart(2, '0')}:${initialMinute.toString().padStart(2, '0')}`;
  
  // Default end time is 2 hours later
  const defaultEndHour = (initialHour + 2) % 24;
  const defaultEndTime = `${defaultEndHour.toString().padStart(2, '0')}:${initialMinute.toString().padStart(2, '0')}`;

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    startTime: initialTime,
    endTime: defaultEndTime,
  });

  // Reset times when dialog opens with new values
  useEffect(() => {
    if (open) {
      const newStartTime = `${initialHour.toString().padStart(2, '0')}:${initialMinute.toString().padStart(2, '0')}`;
      const newEndHour = (initialHour + 2) % 24;
      const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${initialMinute.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime,
      }));
    }
  }, [open, initialHour, initialMinute]);

  const calculatePrice = () => {
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    // Handle next day case
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const durationMinutes = endMinutes - startMinutes;
    const hours = durationMinutes / 60;
    
    // Calculate exact price: price per minute = pricePerHour / 60
    // Total = durationMinutes * (pricePerHour / 60)
    const exactPrice = (durationMinutes / 60) * tablePriceHour;
    
    // Round to nearest 1000đ (optional, or use Math.round for exact)
    return Math.round(exactPrice / 1000) * 1000;
  };

  const calculateDuration = () => {
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${formData.startTime}:00`);
    const endDateTime = new Date(`${selectedDate}T${formData.endTime}:00`);

    // Handle next day case
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    if (startDateTime < new Date()) {
      toast({
        title: 'Lỗi',
        description: 'Không thể đặt bàn trong quá khứ',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await bookingsApi.createPublic({
        tableId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
      });

      toast({
        title: 'Thành công!',
        description: `Đã đặt bàn ${tableCode}. Kiểm tra email để xác nhận.`,
      });

      // Reset form
      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        startTime: initialTime,
        endTime: defaultEndTime,
      });

      onOpenChange(false);
      
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể đặt bàn. Bàn có thể đã được đặt trong khung giờ này.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đặt bàn {tableCode}</DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Giá: {tablePriceHour.toLocaleString()}đ/giờ
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Giờ bắt đầu</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Giờ kết thúc</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Thời lượng: {calculateDuration()}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {selectedDate} {formData.startTime} - {formData.endTime}
                </p>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {calculatePrice().toLocaleString()}đ
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestName">Họ và tên *</Label>
            <Input
              id="guestName"
              placeholder="Nguyễn Văn A"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email *</Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="email@example.com"
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone">Số điện thoại *</Label>
            <Input
              id="guestPhone"
              type="tel"
              placeholder="0912345678"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang đặt...' : 'Xác nhận đặt bàn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
