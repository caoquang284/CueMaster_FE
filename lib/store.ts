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
  mockNotifications,
  mockUsers,
} from './mock-data';

type CreateUserPayload = Pick<User, 'name' | 'email' | 'role'> &
  Partial<Pick<User, 'phone' | 'bio' | 'avatarUrl' | 'status'>> & {
    password?: string;
  };

interface AppState {
  user: User | null;
  users: User[];
  tables: Table[];
  bookings: Booking[];
  menuItems: MenuItem[];
  orders: Order[];
  payments: Payment[];
  notifications: Notification[];

  login: (
    email: string,
    password: string,
    role: string
  ) => { success: boolean; error?: 'invalid_credentials' | 'banned' };
  logout: () => void;

  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateUserProfile: (updates: Pick<User, 'name' | 'phone' | 'bio'>) => void;
  updateUserAvatar: (avatarUrl: string | undefined) => void;
  updateUserPassword: (currentPassword: string, newPassword: string) => boolean;

  addUser: (payload: CreateUserPayload) => {
    success: boolean;
    error?: 'duplicate_email';
    user?: User;
  };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => User['status'] | null;
  resetUserPasswordByAdmin: (id: string, newPassword: string) => boolean;

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
    (set, get) => ({
      user: null,
      users: mockUsers,
      tables: mockTables,
      bookings: mockBookings,
      menuItems: mockMenuItems,
      orders: mockOrders,
      payments: mockPayments,
      notifications: mockNotifications,

      login: (email: string, password: string, role: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const state = get();
        const existing = state.users.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );

        if (existing) {
          if (existing.status === 'banned') {
            return { success: false, error: 'banned' as const };
          }

          const expectedPassword = existing.password ?? 'password123';
          if (expectedPassword && password !== expectedPassword) {
            return { success: false, error: 'invalid_credentials' as const };
          }

          const updatedUser: User = {
            ...existing,
            lastLoginAt: new Date().toISOString(),
          };

          set({
            user: updatedUser,
            users: state.users.map((u) =>
              u.id === existing.id ? updatedUser : u
            ),
          });

          return { success: true };
        }

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role: role as any,
          status: 'active',
          phone: '',
          bio: '',
          avatarUrl: undefined,
          password: password || 'password123',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        set({
          user: newUser,
          users: [...state.users, newUser],
        });

        return { success: true };
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

      updateUserProfile: (updates) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updates };
          return {
            user: updatedUser,
            users: state.users.map((u) =>
              u.id === state.user!.id ? { ...u, ...updates } : u
            ),
          };
        }),

      updateUserAvatar: (avatarUrl) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, avatarUrl };
          return {
            user: updatedUser,
            users: state.users.map((u) =>
              u.id === state.user!.id ? { ...u, avatarUrl } : u
            ),
          };
        }),

      updateUserPassword: (currentPassword, newPassword) => {
        const state = get();
        const user = state.user;
        if (!user) return false;
        const storedUser = state.users.find((u) => u.id === user.id);
        const expectedPassword =
          storedUser?.password ?? user.password ?? 'password123';
        if (expectedPassword && expectedPassword !== currentPassword) {
          return false;
        }
        const updatedUser = { ...user, password: newPassword };
        set({
          user: updatedUser,
          users: state.users.map((u) =>
            u.id === user.id ? { ...u, password: newPassword } : u
          ),
        });
        return true;
      },

      addUser: (payload) => {
        const state = get();
        const normalizedEmail = payload.email.trim().toLowerCase();
        const duplicate = state.users.some(
          (u) => u.email.toLowerCase() === normalizedEmail
        );
        if (duplicate) {
          return { success: false, error: 'duplicate_email' as const };
        }
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: payload.email,
          name: payload.name,
          role: payload.role,
          status: payload.status ?? 'active',
          phone: payload.phone ?? '',
          bio: payload.bio ?? '',
          avatarUrl: payload.avatarUrl,
          password: payload.password ?? 'password123',
          createdAt: new Date().toISOString(),
          lastLoginAt: undefined,
        };
        set({
          users: [...state.users, newUser],
        });
        return { success: true, user: newUser };
      },

      updateUser: (id, updates) =>
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          );
          const shouldUpdateCurrent =
            state.user && state.user.id === id
              ? { user: { ...state.user, ...updates } }
              : {};
          return {
            users: updatedUsers,
            ...shouldUpdateCurrent,
          };
        }),

      deleteUser: (id) =>
        set((state) => {
          const remainingUsers = state.users.filter((u) => u.id !== id);
          const shouldClearCurrent =
            state.user && state.user.id === id ? { user: null } : {};
          return {
            users: remainingUsers,
            ...shouldClearCurrent,
          };
        }),

      toggleUserStatus: (id) => {
        const state = get();
        const target = state.users.find((u) => u.id === id);
        if (!target) {
          return null;
        }
        const nextStatus: User['status'] =
          target.status === 'active' ? 'banned' : 'active';
        set({
          users: state.users.map((u) =>
            u.id === id ? { ...u, status: nextStatus } : u
          ),
          user:
            state.user && state.user.id === id
              ? { ...state.user, status: nextStatus }
              : state.user,
        });
        if (nextStatus === 'banned' && state.user?.id === id) {
          set({ user: null });
        }
        return nextStatus;
      },

      resetUserPasswordByAdmin: (id, newPassword) => {
        const state = get();
        const target = state.users.find((u) => u.id === id);
        if (!target) return false;
        set({
          users: state.users.map((u) =>
            u.id === id ? { ...u, password: newPassword } : u
          ),
          user:
            state.user && state.user.id === id
              ? { ...state.user, password: newPassword }
              : state.user,
        });
        return true;
      },

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
      partialize: (state) => ({ user: state.user, users: state.users }),
    }
  )
);
