import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async updateProfile(
    userId: string,
    data: { nickname?: string; avatar?: string; bio?: string },
  ): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
