import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VALID_ENTITY_TYPES = ['course', 'artwork', 'post'] as const;

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, entityType: string, entityId: string) {
    if (
      !VALID_ENTITY_TYPES.includes(
        entityType as (typeof VALID_ENTITY_TYPES)[number],
      )
    ) {
      throw new NotFoundException(`Invalid entity type: ${entityType}`);
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_entityType_entityId: { userId, entityType, entityId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });

      // Decrement like count on the entity
      if (entityType === 'artwork') {
        await this.prisma.artwork.update({
          where: { id: entityId },
          data: { likeCount: { decrement: 1 } },
        });
      } else if (entityType === 'post') {
        await this.prisma.post.update({
          where: { id: entityId },
          data: { likeCount: { decrement: 1 } },
        });
      }

      this.logger.log(
        `Favorite removed: ${entityType}/${entityId} by user ${userId}`,
      );
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, entityType, entityId },
    });

    // Increment like count on the entity
    if (entityType === 'artwork') {
      await this.prisma.artwork.update({
        where: { id: entityId },
        data: { likeCount: { increment: 1 } },
      });
    } else if (entityType === 'post') {
      await this.prisma.post.update({
        where: { id: entityId },
        data: { likeCount: { increment: 1 } },
      });
    }

    this.logger.log(
      `Favorite added: ${entityType}/${entityId} by user ${userId}`,
    );
    return { favorited: true };
  }

  async check(userId: string, entityType: string, entityId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_entityType_entityId: { userId, entityType, entityId },
      },
    });
    return { favorited: !!existing };
  }

  async getMyFavorites(
    userId: string,
    entityType?: string,
    page = 1,
    pageSize = 20,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.FavoriteWhereInput = { userId };
    if (entityType) where.entityType = entityType;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({ where }),
    ]);

    return {
      data: favorites,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
