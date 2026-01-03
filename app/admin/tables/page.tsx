"use client";

import { useState } from 'react';
import { useTables } from '@/lib/hooks/use-tables';
import { tablesApi } from '@/lib/api/tables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TableType, TableStatus } from '@/lib/types';
import { Search, Plus, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { useToast } from '@/hooks/use-toast';

export default function TablesPage() {
  const { tables, isLoading, isError, mutate } = useTables();
  const [filterType, setFilterType] = useState<TableType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    type: 'POOL' as TableType,
    priceHour: '',
  });

  if (isLoading) return <PageSkeleton />;
  
  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load tables</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const filteredTables = (tables || []).filter((table) => {
    const matchesType = filterType === 'all' || table.type === filterType;
    const matchesSearch = table.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const statusColors: Record<TableStatus, string> = {
    IDLE: 'bg-emerald-500',
    PLAYING: 'bg-orange-500',
    RESERVED: 'bg-blue-500',
  };

  const statusLabels: Record<TableStatus, string> = {
    IDLE: 'Available',
    PLAYING: 'Playing',
    RESERVED: 'Reserved',
  };

  const handleCreateTable = async () => {
    if (!formData.code || !formData.priceHour) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    try {
      await tablesApi.create({
        code: formData.code,
        type: formData.type,
        priceHour: parseInt(formData.priceHour),
      });
      await mutate();
      toast({ title: 'Success', description: 'Table created successfully' });
      setIsCreateDialogOpen(false);
      setFormData({ code: '', type: 'POOL', priceHour: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (id: string, status: TableStatus) => {
    try {
      setUpdating(id);
      await tablesApi.updateStatus(id, status);
      await mutate();
      toast({ title: 'Success', description: 'Table status updated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleStartTable = async (id: string) => {
    try {
      setUpdating(id);
      await tablesApi.start(id);
      await mutate();
      toast({ title: 'Success', description: 'Table started' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleEndTable = async (id: string) => {
    try {
      setUpdating(id);
      await tablesApi.end(id);
      await mutate();
      toast({ title: 'Success', description: 'Table ended' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Table Code</Label>
                      <Input
                        id="code"
                        placeholder="e.g., T01"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: TableType) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POOL">Pool</SelectItem>
                          <SelectItem value="SNOOKER">Snooker</SelectItem>
                          <SelectItem value="CAROM">Carom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceHour">Price per Hour (VND)</Label>
                      <Input
                        id="priceHour"
                        type="number"
                        placeholder="50000"
                        value={formData.priceHour}
                        onChange={(e) => setFormData({ ...formData, priceHour: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTable}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  <SelectItem value="POOL">Pool</SelectItem>
                  <SelectItem value="SNOOKER">Snooker</SelectItem>
                  <SelectItem value="CAROM">Carom</SelectItem>
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
                  table.status === 'IDLE' && 'border-emerald-500/30 bg-emerald-500/5',
                  table.status === 'PLAYING' && 'border-orange-500/30 bg-orange-500/5',
                  table.status === 'RESERVED' && 'border-blue-500/30 bg-blue-500/5'
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{table.code}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{table.type}</p>
                  </div>
                  <Badge variant={table.status === 'IDLE' ? 'default' : table.status === 'PLAYING' ? 'destructive' : 'secondary'}>
                    {statusLabels[table.status]}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-slate-900 mb-1 dark:text-white">
                    {table.priceHour.toLocaleString()}đ
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">per hour</div>
                </div>

                {table.startedAt && table.status === 'PLAYING' && (
                  <div className="mb-3 text-xs text-slate-600 dark:text-slate-400">
                    Started: {new Date(table.startedAt).toLocaleTimeString()}
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  {table.status === 'IDLE' && (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleStartTable(table.id)}
                      disabled={updating === table.id}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {updating === table.id ? 'Starting...' : 'Start'}
                    </Button>
                  )}
                  {table.status === 'PLAYING' && (
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => handleEndTable(table.id)}
                      disabled={updating === table.id}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      {updating === table.id ? 'Ending...' : 'End'}
                    </Button>
                  )}
                  <Select
                    value={table.status}
                    onValueChange={(value) => handleUpdateStatus(table.id, value as TableStatus)}
                    disabled={updating === table.id}
                  >
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectItem value="IDLE">Idle</SelectItem>
                      <SelectItem value="PLAYING">Playing</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-500 mb-1">
              {(tables || []).filter(t => t.status === 'IDLE').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Available</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {(tables || []).filter(t => t.status === 'PLAYING').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Playing</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(tables || []).filter(t => t.status === 'RESERVED').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Reserved</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
