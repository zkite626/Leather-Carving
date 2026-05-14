import { apiClient } from './api-client';

export interface IBanner {
  id: string;
  title: string;
  image: string;
  link?: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
}

export async function getBanners(position?: string): Promise<IBanner[]> {
  const params = new URLSearchParams();
  if (position) params.set('position', position);
  const qs = params.toString();
  const res = await apiClient.get(`/banners${qs ? `?${qs}` : ''}`);
  return res.data.data;
}
