import { apiClient, getAccessToken } from './api-client';
import type { ApiResponse } from '@/shared/types/api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function streamChat(params: {
  message: string;
  sessionId?: string;
  context?: string;
  onChunk: (content: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const { message, sessionId, context, onChunk, onDone, onError } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const token = getAccessToken();

  try {
    const response = await fetch(`${baseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, sessionId, context }),
    });

    if (!response.ok) {
      onError(`HTTP ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.done) {
            onDone();
            return;
          }
          if (parsed.content) {
            onChunk(parsed.content);
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    onDone();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    onError(message);
  }
}

export async function generatePattern(params: { prompt: string; style?: string; size?: string }) {
  const res = await apiClient.post<ApiResponse<{ imageUrl: string; prompt: string; style?: string }>>(
    '/ai/pattern/generate',
    params,
  );
  return res.data;
}

export async function recommendCourses(params?: { preferences?: string; limit?: number }) {
  const res = await apiClient.post<ApiResponse<{ recommendations: string }>>('/ai/recommend/courses', params || {});
  return res.data;
}

export async function recommendProducts(params?: { preferences?: string; limit?: number }) {
  const res = await apiClient.post<ApiResponse<{ recommendations: string }>>('/ai/recommend/products', params || {});
  return res.data;
}
