import { z } from 'zod';

// ===== Auth Validators =====
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[0-9]/, '密码必须包含数字'),
  nickname: z
    .string()
    .min(2, '昵称至少 2 个字符')
    .max(20, '昵称最多 20 个字符'),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token 不能为空'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[0-9]/, '密码必须包含数字'),
});

// ===== User Validators =====
export const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/)
    .optional(),
});

// ===== Pagination =====
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
