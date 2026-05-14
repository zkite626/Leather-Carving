"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('请输入有效的邮箱地址'),
    password: zod_1.z
        .string()
        .min(8, '密码至少 8 位')
        .regex(/[a-z]/, '密码必须包含小写字母')
        .regex(/[A-Z]/, '密码必须包含大写字母')
        .regex(/[0-9]/, '密码必须包含数字'),
    nickname: zod_1.z.string().min(2, '昵称至少 2 个字符').max(20, '昵称最多 20 个字符'),
    phone: zod_1.z
        .string()
        .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
        .optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('请输入有效的邮箱地址'),
    password: zod_1.z.string().min(1, '请输入密码'),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh Token 不能为空'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('请输入有效的邮箱地址'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z
        .string()
        .min(8, '密码至少 8 位')
        .regex(/[a-z]/, '密码必须包含小写字母')
        .regex(/[A-Z]/, '密码必须包含大写字母')
        .regex(/[0-9]/, '密码必须包含数字'),
});
exports.updateProfileSchema = zod_1.z.object({
    nickname: zod_1.z.string().min(2).max(20).optional(),
    avatar: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().max(500).optional(),
    phone: zod_1.z
        .string()
        .regex(/^1[3-9]\d{9}$/)
        .optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
//# sourceMappingURL=index.js.map