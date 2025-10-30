"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Square, Calendar, TrendingUp } from 'lucide-react';
import { mockDailyRevenue, mockTableUsage } from '@/lib/mock-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { tables, bookings, payments } = useAppStore();
  const [realtimeUpdate, setRealtimeUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeUpdate(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const todayRevenue = payments
    .filter(p => p.createdAt.startsWith('2025-10-26'))
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const activeTables = tables.filter(t => t.status === 'occupied').length;
  const todayBookings = bookings.filter(b => b.startTime.startsWith('2025-10-26')).length;

  const statusColors = {
    available: 'bg-emerald-500',
    occupied: 'bg-orange-500',
    reserved: 'bg-blue-500',
    maintenance: 'bg-red-500',
  };

  const statusLabels = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    maintenance: 'Maintenance',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your billiard business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {todayRevenue.toLocaleString()}đ
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-500">+12.5%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Tables
            </CardTitle>
            <Square className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeTables} / {tables.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((activeTables / tables.length) * 100)}% occupied
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Today's Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{todayBookings}</div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-blue-500">+3</span> new bookings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+18.2%</div>
            <p className="text-xs text-slate-500 mt-1">vs last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Top Tables Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockTableUsage.slice(0, 3)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="tableName"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="usageCount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Table Floor Map
            <span className="text-xs font-normal text-slate-400">
              (Live updates every 5s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div
                key={`${table.id}-${realtimeUpdate}`}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-500 hover:scale-105',
                  table.status === 'available' && 'border-emerald-500 bg-emerald-500/10',
                  table.status === 'occupied' && 'border-orange-500 bg-orange-500/10',
                  table.status === 'reserved' && 'border-blue-500 bg-blue-500/10',
                  table.status === 'maintenance' && 'border-red-500 bg-red-500/10'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{table.name}</span>
                  <div className={cn('h-3 w-3 rounded-full', statusColors[table.status])} />
                </div>
                <div className="text-xs text-slate-400 mb-1">{table.type}</div>
                <div className="text-sm font-medium text-white">
                  {table.pricePerHour.toLocaleString()}đ/h
                </div>
                <div className="text-xs text-slate-500 mt-2 capitalize">
                  {statusLabels[table.status]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
