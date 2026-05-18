import { apiClient } from './api-client';

export async function uploadImage(
  file: File,
  type = 'artwork',
): Promise<{ url: string; thumbnailUrl?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await apiClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
