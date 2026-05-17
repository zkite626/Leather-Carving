import { apiClient } from './api-client';
import type { ApiResponse } from '@/shared/types/api';
import type { IProduct, IProductCategory } from '@/shared/types/product';

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  isGuangxi?: boolean;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  sortBy?: 'createdAt' | 'sales' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductDetail extends IProduct {
  reviews: Array<{
    id: string;
    rating: number;
    content?: string;
    images?: string[];
    user: { id: string; nickname: string; avatar?: string };
    createdAt: string;
  }>;
  reviewSummary: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
}

// ==================== Product API ====================

export async function getProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.isGuangxi !== undefined) params.set('isGuangxi', String(query.isGuangxi));
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const res = await apiClient.get(`/shop/products?${params.toString()}`);
  const envelope = res.data; // { code, message, data: { data: [...], pagination } }
  const inner = envelope?.data ?? {};
  return {
    data: Array.isArray(inner.data) ? inner.data : [],
    pagination: inner.pagination ?? { page: 1, pageSize: 24, total: 0, totalPages: 0 },
  };
}

export async function getProductBySlug(slug: string) {
  const res = await apiClient.get(`/shop/products/${slug}`);
  return res.data?.data?.data ?? res.data?.data ?? null;
}

export async function getCategories() {
  const res = await apiClient.get<ApiResponse<IProductCategory[]>>('/shop/categories');
  return res.data.data;
}

export async function getGuangxiProducts() {
  const res = await apiClient.get<ApiResponse<IProduct[]>>('/shop/products/guangxi');
  return res.data.data;
}

export async function getHotProducts() {
  const res = await apiClient.get<ApiResponse<IProduct[]>>('/shop/products/hot');
  return res.data.data;
}

export async function getNewProducts() {
  const res = await apiClient.get<ApiResponse<IProduct[]>>('/shop/products/new');
  return res.data.data;
}
