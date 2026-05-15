import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;
const REDIS_REFRESH_PREFIX = 'auth:refresh:';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nickname: dto.nickname,
        phone: dto.phone,
        role: UserRole.LEARNER,
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

  async login(email: string, password: string): Promise<TokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update last login time
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

  async refresh(refreshToken: string): Promise<TokenResponse> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if refresh token exists in Redis
    const storedToken = await this.redis.get(
      `${REDIS_REFRESH_PREFIX}${payload.sub}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Delete old refresh token (rotation)
    await this.redis.del(`${REDIS_REFRESH_PREFIX}${payload.sub}`);

    // Fetch current user to ensure they still exist and are active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
      user: this.formatUser(user),
    };
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`${REDIS_REFRESH_PREFIX}${userId}`);
    this.logger.log(`User logged out: ${userId}`);
  }

  private formatUser(user: {
    id: string;
    email: string;
    nickname: string;
    avatar?: string | null;
    role: UserRole;
    phone?: string | null;
    bio?: string | null;
    emailVerified: boolean;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date | null;
  }) {
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

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const jti = uuidv4();

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
      role,
      jti,
    };

    const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '2h') as
      | number
      | `${number}s`
      | `${number}m`
      | `${number}h`
      | `${number}d`;
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as
      | number
      | `${number}s`
      | `${number}m`
      | `${number}h`
      | `${number}d`;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshExpiresIn,
      }),
    ]);

    // Store refresh token in Redis with TTL
    const refreshTtl = this.parseDurationToSeconds(
      process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    );
    await this.redis.set(
      `${REDIS_REFRESH_PREFIX}${userId}`,
      refreshToken,
      refreshTtl,
    );

    return { accessToken, refreshToken };
  }

  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // default 7 days
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
}
