import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateArtworkDto,
  UpdateArtworkDto,
  QueryArtworkDto,
} from './dto/create-artwork.dto';

const MAX_IMAGES = 9;

@Injectable()
export class ArtworkService {
  private readonly logger = new Logger(ArtworkService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateArtworkDto) {
    const artwork = await this.prisma.artwork.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        techniques: dto.techniques ?? [],
        materials: dto.materials ?? [],
        tags: dto.tags ?? [],
        story: dto.story,
        status: 'DRAFT',
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
      },
    });

    this.logger.log(`Artwork created: ${artwork.id} by user ${userId}`);
    return artwork;
  }

  async addImages(artworkId: string, userId: string, imageUrls: string[]) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { images: true },
    });

    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    const currentCount = artwork.images.length;
    if (currentCount + imageUrls.length > MAX_IMAGES) {
      throw new BadRequestException(
        `Maximum ${MAX_IMAGES} images allowed. Currently: ${currentCount}`,
      );
    }

    const images = await Promise.all(
      imageUrls.map((url, index) =>
        this.prisma.artworkImage.create({
          data: {
            artworkId,
            url,
            sortOrder: currentCount + index,
          },
        }),
      ),
    );

    // Auto-set first image as cover
    if (currentCount === 0 && imageUrls.length > 0) {
      await this.prisma.artwork.update({
        where: { id: artworkId },
        data: { coverImage: imageUrls[0] },
      });
    }

    return images;
  }

  async setCoverImage(artworkId: string, userId: string, imageId: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { images: true },
    });

    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    const image = artwork.images.find((img) => img.id === imageId);
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.artwork.update({
      where: { id: artworkId },
      data: { coverImage: image.url },
    });

    return { message: 'Cover image updated' };
  }

  async deleteImage(artworkId: string, userId: string, imageId: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { images: true },
    });

    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    const image = artwork.images.find((img) => img.id === imageId);
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.artworkImage.delete({ where: { id: imageId } });

    // If deleted image was cover, set first remaining as cover
    if (artwork.coverImage === image.url) {
      const remaining = artwork.images.filter((img) => img.id !== imageId);
      await this.prisma.artwork.update({
        where: { id: artworkId },
        data: { coverImage: remaining[0]?.url ?? null },
      });
    }
  }

  async reorderImages(artworkId: string, userId: string, imageIds: string[]) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    await Promise.all(
      imageIds.map((id, index) =>
        this.prisma.artworkImage.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  async submitForReview(artworkId: string, userId: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    if (artwork.status !== 'DRAFT' && artwork.status !== 'REJECTED') {
      throw new BadRequestException(
        'Only draft or rejected artworks can be submitted',
      );
    }

    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: { status: 'REVIEWING' },
    });
  }

  async findAll(query: QueryArtworkDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ArtworkWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    if (query.techniques) {
      const techArr = query.techniques.split(',').map((t) => t.trim());
      where.techniques = { hasSome: techArr };
    }

    let orderBy: Prisma.ArtworkOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'likeCount') orderBy = { likeCount: 'desc' };
    if (query.sortBy === 'viewCount') orderBy = { viewCount: 'desc' };

    const [artworks, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          user: {
            select: { id: true, nickname: true, avatar: true, role: true },
          },
        },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return {
      data: artworks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string, incrementView = false) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
        comments: {
          where: { parentId: null, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, nickname: true, avatar: true, role: true },
            },
            replies: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'asc' },
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                    role: true,
                  },
                },
                replies: {
                  where: { deletedAt: null },
                  orderBy: { createdAt: 'asc' },
                  include: {
                    user: {
                      select: {
                        id: true,
                        nickname: true,
                        avatar: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!artwork) throw new NotFoundException('Artwork not found');

    if (incrementView) {
      await this.prisma.artwork.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return artwork;
  }

  async findByUser(userId: string, query: QueryArtworkDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ArtworkWhereInput = { userId, deletedAt: null };

    const [artworks, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return {
      data: artworks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateArtworkDto) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    return this.prisma.artwork.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        techniques: dto.techniques,
        materials: dto.materials,
        tags: dto.tags,
        story: dto.story,
      },
    });
  }

  async remove(id: string, userId: string) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.userId !== userId)
      throw new ForbiddenException('Not your artwork');

    await this.prisma.artwork.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRelated(id: string, limit = 6) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) return [];

    return this.prisma.artwork.findMany({
      where: {
        id: { not: id },
        status: 'PUBLISHED',
        deletedAt: null,
        OR: [
          { techniques: { hasSome: artwork.techniques } },
          { userId: artwork.userId },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
      },
    });
  }
}
