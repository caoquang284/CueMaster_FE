import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Table,
  Booking,
  MenuItem,
  Order,
  Payment,
  Notification,
  TableStatus
} from './types';
import {
  mockTables,
  mockBookings,
  mockMenuItems,
  mockOrders,
  mockPayments,
  mockNotifications
} from './mock-data';

interface AppState {
  user: User | null;
  tables: Table[];
  bookings: Booking[];
  menuItems: MenuItem[];
  orders: Order[];
  payments: Payment[];
  notifications: Notification[];

  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;

  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  closeOrder: (orderId: string) => void;

  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      tables: mockTables,
      bookings: mockBookings,
      menuItems: mockMenuItems,
      orders: mockOrders,
      payments: mockPayments,
      notifications: mockNotifications,

      login: (email: string, password: string, role: string) => {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role: role as any,
        };
        set({ user });
        return true;
      },

      logout: () => set({ user: null }),

      updateTableStatus: (tableId: string, status: TableStatus) =>
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, status } : t
          ),
        })),

      addBooking: (booking) =>
        set((state) => ({
          bookings: [
            ...state.bookings,
            { ...booking, id: Math.random().toString(36).substr(2, 9) },
          ],
        })),

      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      addMenuItem: (item) =>
        set((state) => ({
          menuItems: [
            ...state.menuItems,
            { ...item, id: Math.random().toString(36).substr(2, 9) },
          ],
        })),

      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((m) => m.id !== id),
        })),

      addOrder: (order) =>
        set((state) => ({
          orders: [
            ...state.orders,
            {
              ...order,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      closeOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'closed' as const } : o
          ),
        })),

      addPayment: (payment) =>
        set((state) => ({
          payments: [
            ...state.payments,
            {
              ...payment,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),
    }),
    {
      name: 'cuemaster-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
