// User types - matching Prisma schema
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Table types - matching Prisma schema
export type TableType = 'CAROM' | 'POOL' | 'SNOOKER';
export type TableStatus = 'IDLE' | 'PLAYING' | 'RESERVED';

export interface Table {
  id: string;
  code: string;
  type: TableType;
  status: TableStatus;
  priceHour: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Booking types - matching Prisma schema
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  userId: string | null;
  tableId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  reminderSent: boolean;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  table?: Table;
}

// Menu types - matching Prisma schema
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order types - matching Prisma schema
export type OrderStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  tableId: string;
  bookingId: string | null;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  table?: Table;
  booking?: Booking;
  items?: OrderItem[];
}

// Payment types - matching Prisma schema
export type PaymentMethod = 'CASH' | 'MOMO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Payment {
  id: string;
  orderId: string;
  tableCost: number;
  orderCost: number;
  total: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  order?: Order;
}

// Notification types - matching Prisma schema
export type NotificationType = 'BOOKING' | 'ORDER' | 'PAYMENT' | 'TABLE' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  message?: string; // Alias for content for easier use
  type: NotificationType | string;
  isRead: boolean;
  createdAt: string;
  user?: User;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface TableUsage {
  tableId: string;
  tableName: string;
  usageCount: number;
}
