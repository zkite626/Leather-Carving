import { create } from 'zustand';
import type { INotification } from '@/shared/types/community';
import * as notificationApi from '@/lib/notification-api';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (page?: number) => Promise<{ data: INotification[]; pagination: Record<string, number> | null }>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: INotification) => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      set({ unreadCount: res.data?.count ?? 0 });
    } catch {
      // Silent fail
    }
  },

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const res = await notificationApi.getNotifications({ page, pageSize: 20 });
      const data = res.data;
      if (page === 1) {
        set({ notifications: data, isLoading: false });
      } else {
        set((state) => ({ notifications: [...state.notifications, ...data], isLoading: false }));
      }
      return { data, pagination: res.pagination ?? null };
    } catch {
      set({ isLoading: false });
      return { data: [], pagination: null };
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // Silent fail
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // Silent fail
    }
  },

  addNotification: (notification: INotification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },
}));
