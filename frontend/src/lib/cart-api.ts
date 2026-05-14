import { apiClient } from './api-client';
import type { ApiResponse } from '@/shared/types/api';
import type { ICartItem } from '@/shared/types/product';

export interface CartValidationResult {
  invalidItems: Array<{
    cartItemId: string;
    productId: string;
    reason: string;
  }>;
}

// ==================== Cart API ====================

export async function getCart() {
  const res = await apiClient.get<ApiResponse<ICartItem[]>>('/shop/cart');
  return res.data.data;
}

export async function addToCart(productId: string, quantity = 1) {
  const res = await apiClient.post<ApiResponse<ICartItem>>('/shop/cart', {
    productId,
    quantity,
  });
  return res.data.data;
}

export async function updateCartItem(id: string, quantity: number) {
  const res = await apiClient.patch<ApiResponse<ICartItem>>(`/shop/cart/${id}`, {
    quantity,
  });
  return res.data.data;
}

export async function removeCartItem(id: string) {
  await apiClient.delete(`/shop/cart/${id}`);
}

export async function clearCart() {
  await apiClient.delete('/shop/cart');
}

export async function getCartCount() {
  const res = await apiClient.get<ApiResponse<number>>('/shop/cart/count');
  return res.data.data;
}

export async function validateCart() {
  const res = await apiClient.get<ApiResponse<CartValidationResult>>('/shop/cart/validate');
  return res.data.data;
}
