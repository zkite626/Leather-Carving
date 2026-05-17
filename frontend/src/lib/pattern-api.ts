import { apiClient } from './api-client';
import type { ApiResponse } from '@/shared/types/api';

export interface IPatternAsset {
  id: string;
  name: string;
  category?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  origin?: string;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatternQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
}

export async function getPatterns(query: PatternQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.category) params.set('category', query.category);
  if (query.keyword) params.set('keyword', query.keyword);

  const res = await apiClient.get(`/patterns?${params}`);
  const inner = res.data?.data ?? {};
  return {
    data: Array.isArray(inner.data) ? inner.data : [],
    pagination: inner.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };
}

export async function getPatternById(id: string) {
  const res = await apiClient.get<ApiResponse<IPatternAsset>>(`/patterns/${id}`);
  return res.data;
}

export async function incrementPatternDownload(id: string) {
  const res = await apiClient.post<ApiResponse<null>>(`/patterns/${id}/download`);
  return res.data;
}
