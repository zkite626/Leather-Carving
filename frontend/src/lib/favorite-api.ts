import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';

export interface FavoriteItem {
  id: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export async function toggleFavorite(entityType: string, entityId: string) {
  const res = await apiClient.post<ApiResponse<{ favorited: boolean }>>(
    `/favorites/${entityType}/${entityId}`,
  );
  return res.data;
}

export async function checkFavorite(entityType: string, entityId: string) {
  const res = await apiClient.get<ApiResponse<{ favorited: boolean }>>(
    `/favorites/check/${entityType}/${entityId}`,
  );
  return res.data;
}

export async function getMyFavorites(entityType?: string, page = 1, pageSize = 20) {
  const params = new URLSearchParams();
  if (entityType) params.set('entityType', entityType);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const res = await apiClient.get<PaginatedResponse<FavoriteItem>>(`/favorites/my?${params}`);
  return res.data;
}
