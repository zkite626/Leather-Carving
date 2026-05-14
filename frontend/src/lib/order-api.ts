import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { IOrder, OrderStatus } from '@/shared/types/product';
import type { IAddress } from './address-api';

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  address: Omit<IAddress, 'id' | 'isDefault'>;
  remark?: string;
}

export interface OrderQuery {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

// ==================== Order API ====================

export async function createOrder(data: CreateOrderData) {
  const res = await apiClient.post<ApiResponse<IOrder>>('/shop/orders', data);
  return res.data.data;
}

export async function getOrders(query: OrderQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.status) params.set('status', query.status);

  const res = await apiClient.get<PaginatedResponse<IOrder>>(
    `/shop/orders?${params.toString()}`,
  );
  return res.data;
}

export async function getOrder(id: string) {
  const res = await apiClient.get<ApiResponse<IOrder>>(`/shop/orders/${id}`);
  return res.data.data;
}

export async function payOrder(id: string, method = 'MOCK') {
  const res = await apiClient.post<ApiResponse<{ payUrl?: string }>>(
    `/shop/orders/${id}/pay`,
    { method },
  );
  return res.data.data;
}

export async function cancelOrder(id: string) {
  const res = await apiClient.post<ApiResponse<IOrder>>(`/shop/orders/${id}/cancel`);
  return res.data.data;
}

export async function confirmOrder(id: string) {
  const res = await apiClient.post<ApiResponse<IOrder>>(`/shop/orders/${id}/confirm`);
  return res.data.data;
}
