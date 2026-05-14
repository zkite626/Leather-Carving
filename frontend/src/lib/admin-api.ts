import { apiClient } from './api-client';

// ─── Dashboard ──────────────────────────────────────────────────

export interface AdminDashboardData {
  userCount: number;
  courseCount: number;
  orderCount: number;
  revenue: number;
  todayNewUsers: number;
  todayOrders: number;
  todayRevenue: number;
  userGrowthChart: Array<{ date: string; count: number }>;
  revenueChart: Array<{ date: string; amount: number }>;
  topCourses: Array<{ id: string; title: string; enrollCount: number; coverImage: string | null }>;
}

export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  user: { id: string; nickname: string; avatar: string | null } | null;
}

export async function getAdminDashboard(period?: string): Promise<AdminDashboardData> {
  const res = await apiClient.get('/admin/dashboard', { params: { period } });
  return res.data.data;
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  const res = await apiClient.get('/admin/dashboard/activities');
  return res.data.data;
}

// ─── Users ──────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { artworks: number; orders: number; enrollments: number };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export async function getAdminUsers(params: Record<string, string | number | undefined>): Promise<PaginatedResult<AdminUser>> {
  const res = await apiClient.get('/admin/users', { params });
  return res.data.data;
}

export async function updateUserRole(id: string, role: string) {
  const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return res.data.data;
}

export async function updateUserStatus(id: string, status: string, reason?: string) {
  const res = await apiClient.patch(`/admin/users/${id}/status`, { status, reason });
  return res.data.data;
}

// ─── Content Review ─────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  type: string;
  title: string;
  status: string;
  author: { id: string; nickname: string; avatar: string | null };
  createdAt: string;
  updatedAt: string;
  content?: string;
  coverImage?: string | null;
}

export async function getContentReview(params: Record<string, string | number | undefined>): Promise<PaginatedResult<ReviewItem>> {
  const res = await apiClient.get('/admin/content/review', { params });
  return res.data.data;
}

export async function approveContent(type: string, id: string, comment?: string) {
  const res = await apiClient.post(`/admin/content/${type}/${id}/approve`, { comment });
  return res.data.data;
}

export async function rejectContent(type: string, id: string, reason: string) {
  const res = await apiClient.post(`/admin/content/${type}/${id}/reject`, { reason });
  return res.data.data;
}

export async function batchApproveContent(ids: string[]) {
  const res = await apiClient.post('/admin/content/batch/approve', { ids });
  return res.data.data;
}

export async function batchRejectContent(ids: string[], reason: string) {
  const res = await apiClient.post('/admin/content/batch/reject', { ids, reason });
  return res.data.data;
}

// ─── Orders ─────────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: string;
  payAmount: string;
  createdAt: string;
  shippedAt: string | null;
  completedAt: string | null;
  user: { id: string; nickname: string; avatar: string | null; email: string };
  items: Array<{ id: string; productName: string; price: string; quantity: number; productImage: string | null }>;
  payments: Array<{ id: string; amount: string; method: string; status: string; paidAt: string | null }>;
}

export async function getAdminOrders(params: Record<string, string | number | undefined>): Promise<PaginatedResult<AdminOrder>> {
  const res = await apiClient.get('/admin/orders', { params });
  return res.data.data;
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await apiClient.patch(`/admin/orders/${id}/status`, { status });
  return res.data.data;
}

// ─── Finance ────────────────────────────────────────────────────

export interface FinanceSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  monthGrowth: number;
  orderCount: number;
  paidOrderCount: number;
  averageOrderValue: number;
}

export interface Transaction {
  id: string;
  transactionNo: string | null;
  amount: string;
  method: string;
  status: string;
  paidAt: string | null;
  order: {
    orderNo: string;
    user: { id: string; nickname: string; email: string };
    items: Array<{ productName: string; quantity: number; price: string }>;
  };
}

export interface MerchantSettlement {
  merchantId: string;
  nickname: string;
  email: string;
  totalAmount: number;
  orderCount: number;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const res = await apiClient.get('/admin/finance/summary');
  return res.data.data;
}

export async function getTransactions(params: Record<string, string | number | undefined>): Promise<PaginatedResult<Transaction>> {
  const res = await apiClient.get('/admin/finance/transactions', { params });
  return res.data.data;
}

export async function getMerchantSettlements(): Promise<MerchantSettlement[]> {
  const res = await apiClient.get('/admin/finance/settlements');
  return res.data.data;
}

export function getExportUrl(params: Record<string, string | undefined>): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return `${base}/admin/finance/export${qs ? `?${qs}` : ''}`;
}

// ─── Audit Logs ─────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: unknown;
  newData: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; nickname: string; email: string; avatar: string | null } | null;
}

export async function getAuditLogs(params: Record<string, string | number | undefined>): Promise<PaginatedResult<AuditLogEntry>> {
  const res = await apiClient.get('/admin/audit-logs', { params });
  return res.data.data;
}

// ─── AI Configs ─────────────────────────────────────────────────

export interface AiModelConfig {
  id: string;
  capability: string;
  providerType: string;
  displayName: string;
  baseUrl: string | null;
  apiKey: string | null;
  modelName: string;
  isActive: boolean;
  extraParams: unknown;
  createdAt: string;
  updatedAt: string;
}

export async function getAiConfigs(): Promise<AiModelConfig[]> {
  const res = await apiClient.get('/ai/configs');
  return res.data.data;
}

export async function createAiConfig(data: Record<string, unknown>): Promise<AiModelConfig> {
  const res = await apiClient.post('/ai/configs', data);
  return res.data.data;
}

export async function updateAiConfig(id: string, data: Record<string, unknown>): Promise<AiModelConfig> {
  const res = await apiClient.patch(`/ai/configs/${id}`, data);
  return res.data.data;
}

export async function deleteAiConfig(id: string): Promise<void> {
  await apiClient.delete(`/ai/configs/${id}`);
}

export async function testAiConfig(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.post(`/ai/configs/${id}/test`);
  return res.data.data;
}
