import { apiClient } from './api-client';
import type { IPatternAsset } from './pattern-api';

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

// ─── Users CRUD ─────────────────────────────────────────────────

export async function createUser(data: { email: string; password: string; nickname: string; role?: string; phone?: string }) {
  const res = await apiClient.post('/admin/users', data);
  return res.data.data;
}

export async function getAdminUserById(id: string) {
  const res = await apiClient.get(`/admin/users/${id}`);
  return res.data.data;
}

export async function updateAdminUser(id: string, data: Record<string, unknown>) {
  const res = await apiClient.patch(`/admin/users/${id}`, data);
  return res.data.data;
}

export async function deleteAdminUser(id: string) {
  await apiClient.delete(`/admin/users/${id}`);
}

// ─── Courses (Admin) ────────────────────────────────────────────

export interface AdminCourse {
  id: string; title: string; slug: string; subtitle: string | null;
  coverImage: string | null; level: string; status: string; price: string;
  originalPrice: string | null; isFree: boolean; enrollCount: number; rating: string;
  teacherName: string; createdAt: string;
  _count: { enrollments: number; chapters: number };
}

export async function getAdminCourses(params: Record<string, string | number | undefined>): Promise<PaginatedResult<AdminCourse>> {
  const res = await apiClient.get('/admin/courses', { params });
  return res.data.data;
}

export async function getAdminCourseById(id: string) {
  const res = await apiClient.get(`/admin/courses/${id}`);
  return res.data.data;
}

export async function updateAdminCourseStatus(id: string, status: string) {
  const res = await apiClient.patch(`/admin/courses/${id}/status`, { status });
  return res.data.data;
}

export async function deleteAdminCourse(id: string) {
  await apiClient.delete(`/admin/courses/${id}`);
}

export async function createAdminCourse(data: Record<string, unknown>) {
  const res = await apiClient.post('/admin/courses', data);
  return res.data.data;
}

export async function updateAdminCourse(id: string, data: Record<string, unknown>) {
  const res = await apiClient.patch(`/admin/courses/${id}`, data);
  return res.data.data;
}

// ─── Products (Admin) ───────────────────────────────────────────

export interface AdminProduct {
  id: string; name: string; slug: string; price: string; originalPrice: string | null;
  stock: number; sales: number; status: string; isGuangxi: boolean; rating: string;
  coverImage: string | null; createdAt: string;
  merchant: { id: string; nickname: string; avatar: string | null };
  category: { id: string; name: string };
  images: Array<{ id: string; url: string }>;
  _count: { orderItems: number; reviews: number };
}

export async function getAdminProducts(params: Record<string, string | number | undefined>): Promise<PaginatedResult<AdminProduct>> {
  const res = await apiClient.get('/admin/products', { params });
  return res.data.data;
}

export async function getAdminProductById(id: string) {
  const res = await apiClient.get(`/admin/products/${id}`);
  return res.data.data;
}

export async function updateAdminProductStatus(id: string, status: string) {
  const res = await apiClient.patch(`/admin/products/${id}/status`, { status });
  return res.data.data;
}

export async function deleteAdminProduct(id: string) {
  await apiClient.delete(`/admin/products/${id}`);
}

export async function createAdminProduct(data: Record<string, unknown>) {
  const res = await apiClient.post('/admin/products', data);
  return res.data.data;
}

export async function updateAdminProduct(id: string, data: Record<string, unknown>) {
  const res = await apiClient.patch(`/admin/products/${id}`, data);
  return res.data.data;
}

// ─── Artworks (Admin) ───────────────────────────────────────────

export interface AdminArtwork {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  techniques: string[];
  materials: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  story: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; nickname: string; avatar: string | null };
  images: Array<{ id: string; url: string; caption: string | null; sortOrder: number }>;
}

export async function getAdminArtworks(params: Record<string, string | number | undefined>): Promise<PaginatedResult<AdminArtwork>> {
  const res = await apiClient.get('/admin/artworks', { params });
  return res.data.data;
}

export async function createAdminArtwork(data: Record<string, unknown>): Promise<AdminArtwork> {
  const res = await apiClient.post('/admin/artworks', data);
  return res.data.data;
}

export async function updateAdminArtwork(id: string, data: Record<string, unknown>): Promise<AdminArtwork> {
  const res = await apiClient.patch(`/admin/artworks/${id}`, data);
  return res.data.data;
}

export async function updateAdminArtworkStatus(id: string, status: string) {
  const res = await apiClient.patch(`/admin/artworks/${id}/status`, { status });
  return res.data.data;
}

export async function deleteAdminArtwork(id: string) {
  await apiClient.delete(`/admin/artworks/${id}`);
}

// ─── Patterns (Admin) ───────────────────────────────────────────

export async function getAdminPatterns(params: Record<string, string | number | undefined>): Promise<PaginatedResult<IPatternAsset>> {
  const res = await apiClient.get('/patterns', { params });
  const inner = res.data.data;
  return {
    items: inner.data ?? [],
    pagination: inner.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };
}

export async function createAdminPattern(data: Record<string, unknown>): Promise<IPatternAsset> {
  const res = await apiClient.post('/patterns', data);
  return res.data.data;
}

export async function updateAdminPattern(id: string, data: Record<string, unknown>): Promise<IPatternAsset> {
  const res = await apiClient.patch(`/patterns/${id}`, data);
  return res.data.data;
}

export async function deleteAdminPattern(id: string) {
  await apiClient.delete(`/patterns/${id}`);
}

export interface ProductCategory {
  id: string; name: string; parentId: string | null; icon: string | null;
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  const res = await apiClient.get('/admin/products/categories');
  return res.data.data;
}

// ─── Image Upload ───────────────────────────────────────────────

export async function uploadImage(file: File, type = 'product'): Promise<{ url: string; thumbnailUrl?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await apiClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

// ─── Categories ─────────────────────────────────────────────────

export interface CategoryItem {
  id: string; name: string; slug: string; parentId: string | null;
  icon: string | null; sortOrder: number; _count: { products: number };
  children?: CategoryItem[];
}

export async function getCategories(): Promise<CategoryItem[]> {
  const res = await apiClient.get('/shop/categories');
  return res.data.data;
}

export async function createCategory(data: { name: string; slug: string; icon?: string; parentId?: string; sortOrder?: number }) {
  const res = await apiClient.post('/shop/categories', data);
  return res.data.data;
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  const res = await apiClient.patch(`/shop/categories/${id}`, data);
  return res.data.data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`/shop/categories/${id}`);
}

// ─── SMTP Config ────────────────────────────────────────────────

export interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  fromAddress: string;
  fromName: string;
  encryption: string;
  isActive: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const res = await apiClient.get('/system-settings/smtp');
  return res.data;
}

export async function updateSmtpConfig(data: Record<string, unknown>): Promise<SmtpConfig> {
  const res = await apiClient.put('/system-settings/smtp', data);
  return res.data;
}

export async function verifySmtp(): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.post('/system-settings/smtp/verify');
  return res.data;
}
