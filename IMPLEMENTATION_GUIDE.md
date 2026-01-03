# Hướng dẫn Implementation Frontend CueMaster

## ✅ Đã hoàn thành

### 1. Infrastructure & Core Setup
- ✅ API Client với Axios interceptors
- ✅ Auth Context & Service (Login, Register, Logout)
- ✅ Environment configuration (.env.local)
- ✅ Type definitions matching Prisma schema
- ✅ SWR hooks cho data fetching & caching
- ✅ WebSocket hooks cho real-time updates

### 2. API Services
Đã tạo đầy đủ services cho tất cả modules:
- ✅ `lib/api/auth.ts` - Authentication
- ✅ `lib/api/tables.ts` - Table management
- ✅ `lib/api/bookings.ts` - Booking management
- ✅ `lib/api/menu.ts` - Menu items
- ✅ `lib/api/orders.ts` - Order management
- ✅ `lib/api/payments.ts` - Payment processing
- ✅ `lib/api/users.ts` - User management
- ✅ `lib/api/notifications.ts` - Notifications

### 3. Custom Hooks
- ✅ `use-tables.ts` - Table data hooks
- ✅ `use-bookings.ts` - Booking data hooks
- ✅ `use-menu.ts` - Menu data hooks
- ✅ `use-orders.ts` - Order data hooks
- ✅ `use-users.ts` - User data hooks
- ✅ `use-payments.ts` - Payment data hooks
- ✅ `use-notifications.ts` - Notification hooks
- ✅ `use-websocket.ts` - WebSocket real-time hooks

### 4. Authentication Pages
- ✅ Login page kết nối với API
- ✅ Register page kết nối với API
- ✅ AuthProvider wrapper trong root layout

## 📝 Cần làm tiếp

### 1. Install thêm dependencies
```bash
cd CueMaster_FE
npm install swr socket.io-client
```

### 2. Admin Pages - Cần update để sử dụng real API

#### **Pattern chung cho mọi trang:**

```tsx
// Import hooks và API
import { useTables } from '@/lib/hooks/use-tables';
import { tablesApi } from '@/lib/api/tables';
import { PageSkeleton } from '@/components/loaders/page-skeleton';
import { useToast } from '@/hooks/use-toast';

export default function Page() {
  // 1. Fetch data với SWR hooks
  const { data, isLoading, isError, mutate } = useTables();
  const { toast } = useToast();

  // 2. Loading state
  if (isLoading) return <PageSkeleton />;
  
  // 3. Error state
  if (isError) return <ErrorComponent />;

  // 4. Handle actions
  const handleAction = async () => {
    try {
      await tablesApi.action();
      mutate(); // Refresh data
      toast({ title: 'Success' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error' });
    }
  };

  // 5. Render with real data
  return <div>{/* UI với data thực */}</div>;
}
```

#### **Các trang cần update:**

1. **`app/admin/tables/page.tsx`** ✅ (Đã có example tại page-new.tsx)
   - Sử dụng `useTables()` hook
   - Actions: start, end, updateStatus
   - Real-time updates với WebSocket

2. **`app/admin/bookings/page.tsx`**
   - Sử dụng `useBookings()` hook  
   - Actions: confirm, cancel, complete
   - Filter theo status, table, user

3. **`app/admin/menu/page.tsx`**
   - Sử dụng `useMenu()` hook
   - Actions: create, update, delete, toggle availability
   - Filter theo category

4. **`app/admin/orders/page.tsx`**
   - Sử dụng `useOrders()` hook
   - Actions: create, addItem, updateItem, removeItem, close
   - Real-time updates

5. **`app/admin/payments/page.tsx`**
   - Sử dụng `usePayments()` hook
   - Actions: create payment (CASH/MOMO)
   - Display payment history

6. **`app/admin/users/page.tsx`**
   - Sử dụng `useUsers()` hook
   - Actions: create, update, updateRole, deactivate
   - Filter theo role, status

7. **`app/admin/notifications/page.tsx`**
   - Sử dụng `useNotifications()` hook
   - Actions: markAsRead, markAllAsRead, delete
   - Real-time updates với WebSocket

### 3. Real-time Updates với WebSocket

**Example sử dụng trong Tables page:**

```tsx
import { useTableUpdates } from '@/lib/hooks/use-websocket';

export default function TablesPage() {
  const { tables, mutate } = useTables();

  // Listen for real-time updates
  useTableUpdates((updatedTable) => {
    mutate(); // Refresh data when table updated
    toast({ 
      title: 'Table Updated',
      description: `${updatedTable.code} status changed` 
    });
  });

  // ... rest of component
}
```

### 4. Dashboard Page

**`app/admin/page.tsx`** cần implement:
- Stats cards: Total revenue, total bookings, active tables
- Charts: Revenue over time, table usage
- Recent activities list
- Quick actions

Example:
```tsx
import { useTables } from '@/lib/hooks/use-tables';
import { useBookings } from '@/lib/hooks/use-bookings';
import { usePayments } from '@/lib/hooks/use-payments';

export default function DashboardPage() {
  const { tables } = useTables();
  const { bookings } = useBookings();
  const { payments } = usePayments();

  const stats = {
    totalRevenue: payments?.reduce((sum, p) => sum + p.total, 0) || 0,
    activeTablesCount: tables?.filter(t => t.status === 'PLAYING').length || 0,
    todayBookings: bookings?.filter(/* today logic */).length || 0,
  };

  return (
    <div>
      {/* Stats cards */}
      {/* Charts */}
      {/* Recent activities */}
    </div>
  );
}
```

### 5. Protected Routes

Tạo middleware hoặc layout wrapper để protect admin routes:

```tsx
// app/admin/layout.tsx
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF'))) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <PageSkeleton />;
  if (!user) return null;

  return <>{children}</>;
}
```

### 6. Error Handling & Loading States

Đã có `PageSkeleton` component. Có thể mở rộng thêm:

```tsx
// components/error-boundary.tsx
export function ErrorBoundary({ error, reset }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h2>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={reset}>Thử lại</Button>
      </CardContent>
    </Card>
  );
}
```

## 🔧 Configuration Steps

### 1. Install Dependencies
```bash
cd E:\Đồ án 1\CueMaster_FE
npm install swr socket.io-client axios
```

### 2. Start Backend
```bash
cd E:\Đồ án 1\da1-be
npm run start:dev
```

### 3. Start Frontend
```bash
cd E:\Đồ án 1\CueMaster_FE
npm run dev
```

### 4. Test Authentication
- Truy cập http://localhost:3000/login
- Login với tài khoản từ seed data của BE
- Check console để xem API calls

## 📌 Important Notes

1. **CORS**: Backend đã config `cors: { origin: '*' }` trong main.ts
2. **JWT Token**: Được lưu trong localStorage và auto-attach vào mọi request
3. **Error Handling**: Tất cả errors được handle trong axios interceptor và show toast
4. **Data Refresh**: Sử dụng `mutate()` từ SWR để refresh data sau mỗi action
5. **WebSocket**: Cần import socket.io-client và kết nối với BE gateway
6. **Type Safety**: Tất cả types đã match với Prisma schema của BE

## 🎯 Next Steps Priority

1. Install dependencies (swr, socket.io-client)
2. Copy example Tables page logic sang file chính
3. Update từng admin page theo pattern đã được define
4. Test từng module với BE API
5. Add real-time updates với WebSocket
6. Polish UI/UX và error handling

## 🐛 Debugging Tips

- Check Network tab trong DevTools để xem API calls
- Check Console để xem errors và WebSocket connections
- Verify token trong localStorage
- Test BE endpoints trực tiếp với Swagger (http://localhost:3000/api/docs)
- Use Postman để test API trước khi integrate vào FE
