"use client";

import { useState } from 'react';
import { useMenu } from '@/lib/hooks/use-menu';
import { menuApi } from '@/lib/api/menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { MenuItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import Image from 'next/image';

const CATEGORIES = ['Food', 'Beverage', 'Snack', 'Dessert'];

export default function MenuPage() {
  const { menuItems, isLoading, isError, mutate } = useMenu();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    price: '',
    description: '',
    image: '',
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load menu items</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const filteredItems = (menuItems || []).filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        description: item.description || '',
        image: item.image || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Food',
        price: '',
        description: '',
        image: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description || null,
        image: formData.image || null,
      };

      if (editingItem) {
        await menuApi.update(editingItem.id, data);
        toast({ title: 'Success', description: 'Menu item updated' });
      } else {
        await menuApi.create(data);
        toast({ title: 'Success', description: 'Menu item created' });
      }

      await mutate();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setActioningId(id);
      await menuApi.delete(id);
      await mutate();
      toast({ title: 'Success', description: 'Menu item deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      setActioningId(id);
      await menuApi.toggleAvailability(id);
      await mutate();
      toast({ title: 'Success', description: 'Availability updated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Menu</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage menu items</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">All Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                <div className="relative h-40 bg-slate-200 dark:bg-slate-700">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 dark:text-white">{item.name}</h3>
                  <Badge variant="outline" className="mb-2">{item.category}</Badge>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {item.description || 'No description'}
                  </p>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {item.price.toLocaleString()}đ
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenDialog(item)}
                      disabled={actioningId === item.id}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={item.isAvailable ? 'secondary' : 'default'}
                      onClick={() => handleToggleAvailability(item.id)}
                      disabled={actioningId === item.id}
                    >
                      {item.isAvailable ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={actioningId === item.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No items found
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (VND) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Card key={cat} className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {(menuItems || []).filter(i => i.category === cat).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{cat}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
