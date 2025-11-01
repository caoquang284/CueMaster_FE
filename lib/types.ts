export type UserRole = 'admin' | 'staff' | 'customer';
export type UserStatus = 'active' | 'banned';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  password?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export type TableType = 'Carom' | 'Pool' | 'Snooker';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Table {
  id: string;
  name: string;
  type: TableType;
  status: TableStatus;
  pricePerHour: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  tableId: string;
  tableName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
}

export type MenuCategory = 'Food' | 'Drink' | 'Service';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export type OrderStatus = 'open' | 'closed';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  bookingId: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'momo' | 'zalopay' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: string;
  orderId: string;
  bookingId: string;
  tableId: string;
  tableName: string;
  totalAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
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
