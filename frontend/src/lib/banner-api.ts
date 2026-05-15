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

/** 服务端获取 banner（用于 Server Component） */
export async function getBannersServer(position?: string): Promise<IBanner[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const url = new URL(`${baseUrl}/banners`);
  if (position) url.searchParams.set('position', position);
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}
