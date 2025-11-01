"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, Download } from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const { payments } = useAppStore();
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'all'>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const { toast } = useToast();

  const filteredPayments = payments.filter((payment) => {
    return filterMethod === 'all' || payment.method === filterMethod;
  });

  const handleViewInvoice = (payment: any) => {
    setSelectedPayment(payment);
    setIsInvoiceOpen(true);
  };

  const handleDownloadInvoice = () => {
    toast({
      title: 'Download Started',
      description: 'Invoice is being downloaded',
    });
  };

  const statusColors: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-500',
    completed: 'bg-emerald-500',
    failed: 'bg-red-500',
  };

  const methodIcons: Record<PaymentMethod, string> = {
    cash: '💵',
    momo: '📱',
    zalopay: '📱',
    card: '💳',
  };

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalAmount, 0);
  const todayRevenue = payments
    .filter(p => p.status === 'completed' && p.createdAt.startsWith('2025-10-26'))
    .reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Payments</h1>
        <p className="text-slate-600 dark:text-slate-400">Track all payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="mb-1 text-sm text-slate-600 dark:text-slate-400">Total Revenue</div>
            <div className="text-3xl font-bold text-emerald-500">
              {totalRevenue.toLocaleString()}đ
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="mb-1 text-sm text-slate-600 dark:text-slate-400">Today's Revenue</div>
            <div className="text-3xl font-bold text-blue-500">
              {todayRevenue.toLocaleString()}đ
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="mb-1 text-sm text-slate-600 dark:text-slate-400">Total Transactions</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {payments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle className="text-slate-900 dark:text-white">Payment History</CardTitle>
            <Select value={filterMethod} onValueChange={(value) => setFilterMethod(value as any)}>
              <SelectTrigger className="w-full sm:w-48 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="momo">MoMo</SelectItem>
                <SelectItem value="zalopay">ZaloPay</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <TableHead className="text-slate-600 dark:text-slate-400">Payment ID</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Table</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Method</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Date & Time</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="font-mono text-sm text-slate-900 dark:text-white">
                    #{payment.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{payment.tableName}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {payment.totalAmount.toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span>{methodIcons[payment.method]}</span>
                      <span className="capitalize">{payment.method}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${statusColors[payment.status]} text-white border-0 capitalize`}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                    {new Date(payment.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewInvoice(payment)}
                      className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPayments.length === 0 && (
            <div className="py-12 text-center text-slate-600 dark:text-slate-400">
              No payments found
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-lg dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Payment Invoice</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6 py-4">
              <div className="border-b border-slate-200 pb-4 text-center dark:border-slate-800">
                <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">CueMaster</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Billiard Management System</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Invoice ID:</span>
                  <span className="font-mono text-slate-900 dark:text-white">#{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Table:</span>
                  <span className="text-slate-900 dark:text-white">{selectedPayment.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Payment Method:</span>
                  <span className="capitalize text-slate-900 dark:text-white">
                    {methodIcons[selectedPayment.method as PaymentMethod]} {selectedPayment.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status:</span>
                  <Badge className={statusColors[selectedPayment.status as PaymentStatus]}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Date:</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-slate-600 dark:text-slate-400">Total Amount:</span>
                  <span className="text-3xl font-bold text-emerald-500">
                    {selectedPayment.totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInvoiceOpen(false)}
              className="border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Close
            </Button>
            <Button
              onClick={handleDownloadInvoice}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
