import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { IPost, PostType } from '@/shared/types/community';

export interface CreatePostData {
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
}

export interface UpdatePostData {
  type?: PostType;
  title?: string;
  content?: string;
  images?: string[];
  tags?: string[];
}

export async function getPosts(params: {
  page?: number;
  pageSize?: number;
  type?: PostType;
  keyword?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.type) searchParams.set('type', params.type);
  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const qs = searchParams.toString();
  const res = await apiClient.get(`/community/posts${qs ? `?${qs}` : ''}`);
  const inner = res.data?.data ?? {};
  return {
    data: Array.isArray(inner.data) ? inner.data : [],
    pagination: inner.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };
}

export async function getPostDetail(id: string) {
  const res = await apiClient.get<ApiResponse<IPost>>(`/community/posts/${id}`);
  return res.data;
}

export async function createPost(data: CreatePostData) {
  const res = await apiClient.post<ApiResponse<IPost>>('/community/posts', data);
  return res.data;
}

export async function updatePost(id: string, data: UpdatePostData) {
  const res = await apiClient.patch<ApiResponse<IPost>>(`/community/posts/${id}`, data);
  return res.data;
}

export async function deletePost(id: string) {
  const res = await apiClient.delete<ApiResponse<null>>(`/community/posts/${id}`);
  return res.data;
}

export async function getHotTopics() {
  const res = await apiClient.get<ApiResponse<Array<{ id: string; title: string; likeCount: number }>>>('/community/posts/hot');
  return res.data;
}

export async function getCheckinStatus(postId: string) {
  const res = await apiClient.get<ApiResponse<{ checkedIn: boolean; streak: number }>>(`/community/posts/${postId}/checkin`);
  return res.data;
}

export async function checkin(postId: string) {
  const res = await apiClient.post<ApiResponse<{ checkedIn: boolean; streak: number }>>(`/community/posts/${postId}/checkin`);
  return res.data;
}
