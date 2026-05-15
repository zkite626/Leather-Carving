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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const BCRYPT_ROUNDS = 12;
const REDIS_REFRESH_PREFIX = 'auth:refresh:';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    redis;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, redis) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redis = redis;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                nickname: dto.nickname,
                phone: dto.phone,
                role: client_1.UserRole.LEARNER,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        this.logger.log(`User registered: ${user.email}`);
        return {
            ...tokens,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
            user: this.formatUser(user),
        };
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        this.logger.log(`User logged in: ${user.email}`);
        return {
            ...tokens,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
            user: this.formatUser(user),
        };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const storedToken = await this.redis.get(`${REDIS_REFRESH_PREFIX}${payload.sub}`);
        if (!storedToken || storedToken !== refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        await this.redis.del(`${REDIS_REFRESH_PREFIX}${payload.sub}`);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            ...tokens,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
            user: this.formatUser(user),
        };
    }
    async logout(userId) {
        await this.redis.del(`${REDIS_REFRESH_PREFIX}${userId}`);
        this.logger.log(`User logged out: ${userId}`);
    }
    formatUser(user) {
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatar: user.avatar ?? null,
            role: user.role,
            phone: user.phone ?? null,
            bio: user.bio ?? null,
            emailVerified: user.emailVerified,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt ?? null,
        };
    }
    async generateTokens(userId, email, role) {
        const jti = (0, uuid_1.v4)();
        const payload = {
            sub: userId,
            email,
            role,
            jti,
        };
        const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '2h');
        const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: refreshExpiresIn,
            }),
        ]);
        const refreshTtl = this.parseDurationToSeconds(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d');
        await this.redis.set(`${REDIS_REFRESH_PREFIX}${userId}`, refreshToken, refreshTtl);
        return { accessToken, refreshToken };
    }
    parseDurationToSeconds(duration) {
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60;
        }
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 24 * 60 * 60;
            default:
                return 7 * 24 * 60 * 60;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map