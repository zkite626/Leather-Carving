import { apiClient } from './api-client';
import type { ApiResponse } from '@/shared/types/api';

export interface IAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export type CreateAddressData = Omit<IAddress, 'id'>;
export type UpdateAddressData = Partial<Omit<IAddress, 'id'>>;

// ==================== Address API ====================

export async function getAddresses() {
  const res = await apiClient.get<ApiResponse<IAddress[]>>('/shop/addresses');
  return res.data.data;
}

export async function getAddress(id: string) {
  const res = await apiClient.get<ApiResponse<IAddress>>(`/shop/addresses/${id}`);
  return res.data.data;
}

export async function createAddress(data: CreateAddressData) {
  const res = await apiClient.post<ApiResponse<IAddress>>('/shop/addresses', data);
  return res.data.data;
}

export async function updateAddress(id: string, data: UpdateAddressData) {
  const res = await apiClient.patch<ApiResponse<IAddress>>(`/shop/addresses/${id}`, data);
  return res.data.data;
}

export async function deleteAddress(id: string) {
  await apiClient.delete(`/shop/addresses/${id}`);
}
