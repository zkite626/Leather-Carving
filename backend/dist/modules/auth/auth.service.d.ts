import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
        id: string;
        email: string;
        nickname: string;
        avatar?: string | null;
        role: string;
        phone?: string | null;
        bio?: string | null;
        emailVerified: boolean;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt?: Date | null;
    };
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, redis: RedisService);
    register(dto: RegisterDto): Promise<TokenResponse>;
    login(email: string, password: string): Promise<TokenResponse>;
    refresh(refreshToken: string): Promise<TokenResponse>;
    logout(userId: string): Promise<void>;
    private formatUser;
    private generateTokens;
    private parseDurationToSeconds;
}
