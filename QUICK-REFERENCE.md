# 🚀 QUICK REFERENCE - Pattern Chuẩn

## 📦 1. Import Standard
```tsx
"use client";

import { useState } from 'react';
import { use[Module] } from '@/lib/hooks/use-[module]';
import { [module]Api } from '@/lib/api/[module]';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

## 🎣 2. Hooks Setup
```tsx
export default function Page() {
  // Data fetching
  const { data, isLoading, isError, mutate } = use[Module]();
  
  // Local state
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  
  // Toast
  const { toast } = useToast();
```

## ⚡ 3. Loading & Error States
```tsx
  // Loading
  if (isLoading) return <PageSkeleton />;
  
  // Error
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Không thể tải dữ liệu</p>
        </CardContent>
      </Card>
    );
  }
```

## 🔧 4. Action Handler
```tsx
  const handleCreate = async (payload) => {
    setUpdating('create');
    try {
      await [module]Api.create(payload);
      mutate(); // ← QUAN TRỌNG: Refresh data
      toast({ 
        title: 'Thành công',
        description: 'Đã tạo mới' 
      });
    } catch (error: any) {
      toast({ 
        variant: 'destructive',
        title: 'Lỗi', 
        description: error.message 
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdate = async (id: string, payload) => {
    setUpdating(id);
    try {
      await [module]Api.update(id, payload);
      mutate(); // ← QUAN TRỌNG
      toast({ title: 'Đã cập nhật' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: error.message });
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    setUpdating(id);
    try {
      await [module]Api.delete(id);
      mutate(); // ← QUAN TRỌNG
      toast({ title: 'Đã xóa' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: error.message });
    } finally {
      setUpdating(null);
    }
  };
```

## 🎨 5. Render JSX
```tsx
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tiêu đề</h1>
        <p className="text-muted-foreground">Mô tả</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.map(item => (
            <div key={item.id}>
              {/* Item content */}
              <Button 
                onClick={() => handleUpdate(item.id, {...})}
                disabled={updating === item.id}
              >
                {updating === item.id ? 'Đang xử lý...' : 'Cập nhật'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🔄 6. Real-time Updates
```tsx
import { use[Module]Updates } from '@/lib/hooks/use-websocket';

// In component
use[Module]Updates((updated) => {
  mutate(); // Auto refresh
  toast({ title: `${updated.name} đã thay đổi` });
});
```

## 📋 7. Common Patterns

### Filter Data
```tsx
const filtered = data?.filter(item => {
  if (filter === 'all') return true;
  return item.status === filter;
});
```

### Search
```tsx
const [search, setSearch] = useState('');

const filtered = data?.filter(item => 
  item.name.toLowerCase().includes(search.toLowerCase())
);
```

### Pagination (Manual)
```tsx
const [page, setPage] = useState(1);
const perPage = 10;

const paginated = filtered?.slice(
  (page - 1) * perPage, 
  page * perPage
);
```

### Sort
```tsx
const [sortBy, setSortBy] = useState('createdAt');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

const sorted = [...(data || [])].sort((a, b) => {
  if (sortOrder === 'asc') {
    return a[sortBy] > b[sortBy] ? 1 : -1;
  }
  return a[sortBy] < b[sortBy] ? 1 : -1;
});
```

## 🎯 8. Frequently Used Components

### Button with Loading
```tsx
<Button 
  onClick={handleAction}
  disabled={isLoading}
>
  {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
</Button>
```

### Badge for Status
```tsx
<Badge variant={
  status === 'ACTIVE' ? 'default' : 
  status === 'PENDING' ? 'secondary' : 
  'destructive'
}>
  {status}
</Badge>
```

### Dialog for Forms
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tạo mới</DialogTitle>
    </DialogHeader>
    {/* Form here */}
  </DialogContent>
</Dialog>
```

## 🔐 9. Auth Check
```tsx
import { useAuth } from '@/lib/contexts/auth-context';

const { user } = useAuth();

// Check role
if (user?.role === 'ADMIN') {
  // Show admin features
}

// Check permission
const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
```

## 📊 10. Common Utilities

### Format Date
```tsx
import { format } from 'date-fns';

const formatted = format(new Date(dateString), 'dd/MM/yyyy HH:mm');
```

### Format Currency
```tsx
const formatted = amount.toLocaleString('vi-VN') + 'đ';
```

### Format Status
```tsx
const statusMap = {
  PENDING: 'Đang chờ',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

<span>{statusMap[status]}</span>
```

## ⚠️ 11. Common Mistakes to Avoid

❌ **Quên gọi mutate() sau action**
```tsx
await api.update(id, data);
// Missing mutate()!
```

✅ **Correct:**
```tsx
await api.update(id, data);
mutate(); // ← Don't forget!
```

❌ **Không handle errors**
```tsx
await api.delete(id); // What if error?
```

✅ **Correct:**
```tsx
try {
  await api.delete(id);
} catch (error: any) {
  toast({ variant: 'destructive', title: error.message });
}
```

❌ **Không disable button khi loading**
```tsx
<Button onClick={handleSubmit}>Submit</Button>
```

✅ **Correct:**
```tsx
<Button onClick={handleSubmit} disabled={isLoading}>
  {isLoading ? 'Đang xử lý...' : 'Submit'}
</Button>
```

## 🎓 12. Testing Checklist

- [ ] Loading state hiển thị đúng
- [ ] Error state hiển thị đúng
- [ ] Empty state hiển thị đúng
- [ ] Create action works
- [ ] Update action works
- [ ] Delete action works
- [ ] Toast notifications show
- [ ] Data refreshes after action
- [ ] Button disabled during action
- [ ] Form validation works
- [ ] Network error handled

## 💡 13. Pro Tips

1. **Always use mutate()** sau mọi thao tác CRUD
2. **Always handle errors** với try/catch
3. **Always show feedback** với toast
4. **Always add loading states**
5. **Always validate input** trước khi gọi API
6. **Use TypeScript** để catch errors sớm
7. **Test mọi edge case**
8. **Keep components small** và focused
9. **Reuse components** khi có thể
10. **Comment complex logic**

---

**Copy pattern này cho mọi page và bạn sẽ có code consistent, maintainable! 🚀**
