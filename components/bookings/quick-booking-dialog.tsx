'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { bookingsApi } from '@/lib/api/bookings';

interface QuickBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableCode: string;
  tablePriceHour: number;
  selectedDate: string;
  selectedHour: string;
  onSuccess?: () => void;
}

export function QuickBookingDialog({
  open,
  onOpenChange,
  tableId,
  tableCode,
  tablePriceHour,
  selectedDate,
  selectedHour,
  onSuccess,
}: QuickBookingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse selected hour
  const hourNum = parseInt(selectedHour.split(':')[0]);
  const defaultEndHour = Math.min(hourNum + 2, 23); // Default 2 hours duration

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    startTime: `${selectedDate}T${selectedHour}:00`,
    endTime: `${selectedDate}T${defaultEndHour.toString().padStart(2, '0')}:00:00`,
  });

  const calculatePrice = () => {
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours * tablePriceHour;
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

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      toast({
        title: 'Lỗi',
        description: 'Giờ kết thúc phải sau giờ bắt đầu',
        variant: 'destructive',
      });
      return;
    }

    if (start < new Date()) {
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
        startTime: formData.startTime,
        endTime: formData.endTime,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
      });

      toast({
        title: 'Thành công!',
        description: `Đã đặt bàn ${tableCode} thành công. Kiểm tra email để xác nhận.`,
      });

      // Reset form
      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        startTime: `${selectedDate}T${selectedHour}:00`,
        endTime: `${selectedDate}T${defaultEndHour.toString().padStart(2, '0')}:00:00`,
      });

      onOpenChange(false);
      
      // Force refresh timeline immediately
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể đặt bàn. Vui lòng thử lại.',
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
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Giờ kết thúc</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Tổng giá dự kiến: {calculatePrice().toLocaleString()}đ
            </p>
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
