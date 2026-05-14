import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { IComment } from '@/shared/types/community';

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

export async function getArtworkComments(artworkId: string, page = 1, pageSize = 20) {
  const res = await apiClient.get<PaginatedResponse<IComment>>(
    `/comments/artworks/${artworkId}?page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
}

export async function createArtworkComment(artworkId: string, data: CreateCommentData) {
  const res = await apiClient.post<ApiResponse<IComment>>(
    `/comments/artworks/${artworkId}`,
    data,
  );
  return res.data;
}

export async function getPostComments(postId: string, page = 1, pageSize = 20) {
  const res = await apiClient.get<PaginatedResponse<IComment>>(
    `/comments/posts/${postId}?page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
}

export async function createPostComment(postId: string, data: CreateCommentData) {
  const res = await apiClient.post<ApiResponse<IComment>>(
    `/comments/posts/${postId}`,
    data,
  );
  return res.data;
}

export async function deleteComment(id: string) {
  const res = await apiClient.delete<ApiResponse<null>>(`/comments/${id}`);
  return res.data;
}
