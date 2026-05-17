import { apiClient } from './api-client';
import type { ApiResponse } from '@/shared/types/api';
import type { INotification } from '@/shared/types/community';

export async function getNotifications(params: { page?: number; pageSize?: number; isRead?: boolean } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.isRead !== undefined) searchParams.set('isRead', String(params.isRead));

  const qs = searchParams.toString();
  const res = await apiClient.get(`/notifications${qs ? `?${qs}` : ''}`);
  const inner = res.data?.data ?? {};
  return {
    data: Array.isArray(inner.data) ? inner.data : [],
    pagination: inner.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };
}

export async function getUnreadCount() {
  const res = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  return res.data;
}

export async function markAsRead(id: string) {
  const res = await apiClient.post<ApiResponse<INotification>>(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead() {
  const res = await apiClient.post<ApiResponse<null>>('/notifications/read-all');
  return res.data;
}

export async function deleteNotification(id: string) {
  const res = await apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
  return res.data;
}
