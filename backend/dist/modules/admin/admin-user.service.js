"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminUserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
let AdminUserService = AdminUserService_1 = class AdminUserService {
    prisma;
    logger = new common_1.Logger(AdminUserService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('该邮箱已被注册');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                nickname: dto.nickname,
                role: dto.role ?? client_1.UserRole.LEARNER,
                phone: dto.phone,
            },
            select: {
                id: true, email: true, nickname: true, role: true, status: true, phone: true, createdAt: true,
            },
        });
        this.logger.log(`Admin created user: ${user.email} (${user.role})`);
        return user;
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, nickname: true, avatar: true, phone: true, bio: true,
                role: true, status: true, emailVerified: true, lastLoginAt: true, createdAt: true,
                _count: {
                    select: {
                        artworks: { where: { deletedAt: null } },
                        orders: true,
                        enrollments: true,
                        products: { where: { deletedAt: null } },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        return user;
    }
    async updateUser(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.nickname !== undefined && { nickname: dto.nickname }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.bio !== undefined && { bio: dto.bio }),
                ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            },
            select: {
                id: true, email: true, nickname: true, avatar: true, phone: true, bio: true,
                role: true, status: true, createdAt: true,
            },
        });
        this.logger.log(`Admin updated user: ${id}`);
        return updated;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        if (user.role === client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.BadRequestException('不能删除超级管理员');
        }
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        this.logger.log(`Admin deleted user: ${id}`);
        return { message: '用户已删除' };
    }
    async getUsers(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {
            deletedAt: null,
            ...(query.keyword && {
                OR: [
                    { nickname: { contains: query.keyword, mode: 'insensitive' } },
                    { email: { contains: query.keyword, mode: 'insensitive' } },
                    { phone: { contains: query.keyword } },
                ],
            }),
            ...(query.role && { role: query.role }),
            ...(query.status && { status: query.status }),
        };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    nickname: true,
                    avatar: true,
                    phone: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    lastLoginAt: true,
                    createdAt: true,
                    _count: {
                        select: {
                            artworks: { where: { deletedAt: null } },
                            orders: true,
                            enrollments: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items: users,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async updateUserRole(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.BadRequestException('Cannot modify SUPER_ADMIN role');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { role: dto.role },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                status: true,
            },
        });
        this.logger.log(`User ${userId} role changed: ${user.role} -> ${dto.role}`);
        return updated;
    }
    async updateUserStatus(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.BadRequestException('Cannot modify SUPER_ADMIN status');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { status: dto.status },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                status: true,
            },
        });
        this.logger.log(`User ${userId} status changed: ${user.status} -> ${dto.status}${dto.reason ? ` (reason: ${dto.reason})` : ''}`);
        return updated;
    }
};
exports.AdminUserService = AdminUserService;
exports.AdminUserService = AdminUserService = AdminUserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminUserService);
//# sourceMappingURL=admin-user.service.js.map