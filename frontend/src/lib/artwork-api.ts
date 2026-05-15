import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { IArtwork, IArtworkImage } from '@/shared/types/community';

export interface ArtworkQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
  techniques?: string;
  sortBy?: 'createdAt' | 'likeCount' | 'viewCount';
}

export interface CreateArtworkData {
  title: string;
  description?: string;
  category?: string;
  techniques?: string[];
  materials?: string[];
  tags?: string[];
  story?: string;
}

export interface UpdateArtworkData {
  title?: string;
  description?: string;
  category?: string;
  techniques?: string[];
  materials?: string[];
  tags?: string[];
  story?: string;
}

export async function getArtworks(query: ArtworkQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.category) params.set('category', query.category);
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.techniques) params.set('techniques', query.techniques);
  if (query.sortBy) params.set('sortBy', query.sortBy);

  const res = await apiClient.get(`/artworks?${params}`);
  const inner = res.data?.data ?? {};
  return {
    data: Array.isArray(inner.data) ? inner.data : [],
    pagination: inner.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };
}

export async function getArtworkById(id: string) {
  const res = await apiClient.get<ApiResponse<IArtwork>>(`/artworks/${id}`);
  return res.data;
}

export async function getRelatedArtworks(id: string) {
  const res = await apiClient.get<ApiResponse<IArtwork[]>>(`/artworks/${id}/related`);
  return res.data;
}

export async function getMyArtworks(query: ArtworkQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));

  const res = await apiClient.get(`/artworks/my?${params}`);
  const inner = res.data?.data ?? {};
  return {
    data: Array.isArray(inner.data) ? inner.data : [],
    pagination: inner.pagination ?? { page: 1, pageSize: 12, total: 0, totalPages: 0 },
  };
}

export async function createArtwork(data: CreateArtworkData) {
  const res = await apiClient.post<ApiResponse<IArtwork>>('/artworks', data);
  return res.data;
}

export async function updateArtwork(id: string, data: UpdateArtworkData) {
  const res = await apiClient.patch<ApiResponse<IArtwork>>(`/artworks/${id}`, data);
  return res.data;
}

export async function deleteArtwork(id: string) {
  const res = await apiClient.delete<ApiResponse<null>>(`/artworks/${id}`);
  return res.data;
}

export async function addArtworkImages(id: string, imageUrls: string[]) {
  const res = await apiClient.post<ApiResponse<IArtworkImage[]>>(`/artworks/${id}/images`, { imageUrls });
  return res.data;
}

export async function reorderArtworkImages(id: string, imageIds: string[]) {
  const res = await apiClient.patch<ApiResponse<null>>(`/artworks/${id}/images/reorder`, { imageIds });
  return res.data;
}

export async function setArtworkCover(id: string, imageId: string) {
  const res = await apiClient.post<ApiResponse<null>>(`/artworks/${id}/images/${imageId}/cover`);
  return res.data;
}

export async function deleteArtworkImage(id: string, imageId: string) {
  const res = await apiClient.delete<ApiResponse<null>>(`/artworks/${id}/images/${imageId}`);
  return res.data;
}

export async function submitArtwork(id: string) {
  const res = await apiClient.post<ApiResponse<IArtwork>>(`/artworks/${id}/submit`);
  return res.data;
}

export async function uploadImage(file: File, type = 'artwork'): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await apiClient.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
