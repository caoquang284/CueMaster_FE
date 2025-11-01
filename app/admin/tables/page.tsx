"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TableType, TableStatus } from '@/lib/types';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TablesPage() {
  const { tables, updateTableStatus } = useAppStore();
  const [filterType, setFilterType] = useState<TableType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTables = tables.filter((table) => {
    const matchesType = filterType === 'all' || table.type === filterType;
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const statusColors = {
    available: 'bg-emerald-500',
    occupied: 'bg-orange-500',
    reserved: 'bg-blue-500',
    maintenance: 'bg-red-500',
  };

  const statusBadgeVariant = {
    available: 'default',
    occupied: 'secondary',
    reserved: 'outline',
    maintenance: 'destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Tables</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage billiard tables and their status</p>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">All Tables</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger className="w-full sm:w-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Pool">Pool</SelectItem>
                  <SelectItem value="Snooker">Snooker</SelectItem>
                  <SelectItem value="Carom">Carom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className={cn(
                  'flex h-full flex-col rounded-lg border-2 p-5 transition-all duration-300 hover:shadow-lg',
                  table.status === 'available' && 'border-emerald-500/30 bg-emerald-500/5',
                  table.status === 'occupied' && 'border-orange-500/30 bg-orange-500/5',
                  table.status === 'reserved' && 'border-blue-500/30 bg-blue-500/5',
                  table.status === 'maintenance' && 'border-red-500/30 bg-red-500/5'
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{table.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{table.type}</p>
                  </div>
                  <div className={cn('h-3 w-3 rounded-full', statusColors[table.status])} />
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-slate-900 mb-1 dark:text-white">
                    {table.pricePerHour.toLocaleString()}đ
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">per hour</div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Update Status:</div>
                  <Select
                    value={table.status}
                    onValueChange={(value) => updateTableStatus(table.id, value as TableStatus)}
                  >
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {filteredTables.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No tables found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-500 mb-1">
              {tables.filter(t => t.status === 'available').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Available</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Occupied</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {tables.filter(t => t.status === 'reserved').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Reserved</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-500 mb-1">
              {tables.filter(t => t.status === 'maintenance').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Maintenance</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
