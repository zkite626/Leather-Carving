import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserQueryDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: UserQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
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

  async updateUserRole(userId: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot modify SUPER_ADMIN role');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: { id: true, email: true, nickname: true, role: true, status: true },
    });

    this.logger.log(`User ${userId} role changed: ${user.role} -> ${dto.role}`);
    return updated;
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot modify SUPER_ADMIN status');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
      select: { id: true, email: true, nickname: true, role: true, status: true },
    });

    this.logger.log(`User ${userId} status changed: ${user.status} -> ${dto.status}${dto.reason ? ` (reason: ${dto.reason})` : ''}`);
    return updated;
  }
}
