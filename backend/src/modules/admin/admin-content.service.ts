import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContentReviewQueryDto,
  ApproveContentDto,
  RejectContentDto,
  BatchContentActionDto,
} from './dto';
import {
  ArtworkStatus,
  CourseStatus,
  PostStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class AdminContentService {
  private readonly logger = new Logger(AdminContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getArtworks(query: Record<string, string | number | undefined>) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ArtworkWhereInput = { deletedAt: null };
    if (typeof query.status === 'string' && query.status) {
      where.status = query.status as ArtworkStatus;
    }
    if (typeof query.category === 'string' && query.category) {
      where.category = query.category;
    }
    if (typeof query.keyword === 'string' && query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    const [artworks, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return {
      items: artworks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createArtwork(userId: string, dto: Record<string, unknown>) {
    if (typeof dto.title !== 'string' || !dto.title.trim()) {
      throw new BadRequestException('Artwork title is required');
    }

    const imageUrls = this.toStringArray(dto.imageUrls);
    const artwork = await this.prisma.artwork.create({
      data: {
        userId,
        title: dto.title.trim(),
        description:
          typeof dto.description === 'string' ? dto.description : undefined,
        category: typeof dto.category === 'string' ? dto.category : undefined,
        techniques: this.toStringArray(dto.techniques),
        materials: this.toStringArray(dto.materials),
        tags: this.toStringArray(dto.tags),
        story: typeof dto.story === 'string' ? dto.story : undefined,
        status: this.toArtworkStatus(dto.status, ArtworkStatus.PUBLISHED),
        coverImage: imageUrls[0] ?? undefined,
        images:
          imageUrls.length > 0
            ? {
                create: imageUrls.map((url, index) => ({
                  url,
                  sortOrder: index,
                })),
              }
            : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    this.logger.log(`Admin artwork created: ${artwork.id}`);
    return artwork;
  }

  async updateArtwork(id: string, dto: Record<string, unknown>) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id, deletedAt: null },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');

    const imageUrls = Array.isArray(dto.imageUrls)
      ? this.toStringArray(dto.imageUrls)
      : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (imageUrls) {
        await tx.artworkImage.deleteMany({ where: { artworkId: id } });
      }

      return tx.artwork.update({
        where: { id },
        data: {
          ...(typeof dto.title === 'string' && { title: dto.title.trim() }),
          ...(typeof dto.description === 'string' && {
            description: dto.description,
          }),
          ...(typeof dto.category === 'string' && { category: dto.category }),
          ...(Array.isArray(dto.techniques) && {
            techniques: this.toStringArray(dto.techniques),
          }),
          ...(Array.isArray(dto.materials) && {
            materials: this.toStringArray(dto.materials),
          }),
          ...(Array.isArray(dto.tags) && { tags: this.toStringArray(dto.tags) }),
          ...(typeof dto.story === 'string' && { story: dto.story }),
          ...(typeof dto.status === 'string' && {
            status: this.toArtworkStatus(dto.status, artwork.status),
          }),
          ...(imageUrls && { coverImage: imageUrls[0] ?? null }),
          ...(imageUrls && {
            images: {
              create: imageUrls.map((url, index) => ({ url, sortOrder: index })),
            },
          }),
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      });
    });

    return updated;
  }

  async updateArtworkStatus(id: string, status: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id, deletedAt: null },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');

    return this.prisma.artwork.update({
      where: { id },
      data: { status: this.toArtworkStatus(status, artwork.status) },
    });
  }

  async deleteArtwork(id: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id, deletedAt: null },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');

    await this.prisma.artwork.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getReviewQueue(query: ContentReviewQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const status = query.status ?? 'REVIEWING';
    const type = query.type ?? 'all';

    const results: Array<{
      id: string;
      type: string;
      title: string;
      status: string;
      author: { id: string; nickname: string; avatar: string | null };
      createdAt: Date;
      updatedAt: Date;
      content?: string;
      coverImage?: string | null;
    }> = [];

    // Fetch courses
    if (type === 'all' || type === 'course') {
      const courseStatus =
        status === 'REVIEWING'
          ? CourseStatus.REVIEWING
          : status === 'PUBLISHED'
            ? CourseStatus.PUBLISHED
            : CourseStatus.DRAFT;
      if (status !== 'REJECTED') {
        const courses = await this.prisma.course.findMany({
          where: { status: courseStatus, deletedAt: null },
          skip: type === 'course' ? skip : 0,
          take: type === 'course' ? pageSize : 50,
          include: {
            teacher: {
              include: {
                user: { select: { id: true, nickname: true, avatar: true } },
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        });
        for (const c of courses) {
          results.push({
            id: c.id,
            type: 'course',
            title: c.title,
            status: c.status,
            author: c.teacher.user,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            coverImage: c.coverImage,
          });
        }
      }
    }

    // Fetch artworks
    if (type === 'all' || type === 'artwork') {
      const artworkStatus =
        status === 'REVIEWING'
          ? ArtworkStatus.REVIEWING
          : status === 'PUBLISHED'
            ? ArtworkStatus.PUBLISHED
            : ArtworkStatus.REJECTED;
      const artworks = await this.prisma.artwork.findMany({
        where: { status: artworkStatus, deletedAt: null },
        skip: type === 'artwork' ? skip : 0,
        take: type === 'artwork' ? pageSize : 50,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
      });
      for (const a of artworks) {
        results.push({
          id: a.id,
          type: 'artwork',
          title: a.title,
          status: a.status,
          author: a.user,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          content: a.description ?? undefined,
          coverImage: a.images[0]?.url ?? a.coverImage,
        });
      }
    }

    // Fetch posts
    if (type === 'all' || type === 'post') {
      const postStatus =
        status === 'HIDDEN'
          ? PostStatus.HIDDEN
          : status === 'PUBLISHED'
            ? PostStatus.PUBLISHED
            : PostStatus.PUBLISHED;
      const posts = await this.prisma.post.findMany({
        where: { status: postStatus, deletedAt: null },
        skip: type === 'post' ? skip : 0,
        take: type === 'post' ? pageSize : 50,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
      for (const p of posts) {
        results.push({
          id: p.id,
          type: 'post',
          title: p.title,
          status: p.status,
          author: p.user,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          content: p.content.substring(0, 200),
        });
      }
    }

    // Sort all by updatedAt
    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Apply pagination for 'all' type
    const total = results.length;
    const paginatedResults =
      type === 'all' ? results.slice(skip, skip + pageSize) : results;
    const totalAll =
      type === 'all' ? total : await this.getTotalCount(type, status);

    return {
      items: paginatedResults,
      pagination: {
        page,
        pageSize,
        total: type === 'all' ? total : totalAll,
        totalPages: Math.ceil((type === 'all' ? total : totalAll) / pageSize),
      },
    };
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
  }

  private toArtworkStatus(value: unknown, fallback: ArtworkStatus) {
    if (
      value === ArtworkStatus.DRAFT ||
      value === ArtworkStatus.REVIEWING ||
      value === ArtworkStatus.PUBLISHED ||
      value === ArtworkStatus.REJECTED
    ) {
      return value;
    }
    return fallback;
  }

  private async getTotalCount(type: string, status: string): Promise<number> {
    if (type === 'course') {
      const s =
        status === 'REVIEWING'
          ? CourseStatus.REVIEWING
          : status === 'PUBLISHED'
            ? CourseStatus.PUBLISHED
            : CourseStatus.DRAFT;
      return this.prisma.course.count({
        where: { status: s, deletedAt: null },
      });
    }
    if (type === 'artwork') {
      const s =
        status === 'REVIEWING'
          ? ArtworkStatus.REVIEWING
          : status === 'PUBLISHED'
            ? ArtworkStatus.PUBLISHED
            : ArtworkStatus.REJECTED;
      return this.prisma.artwork.count({
        where: { status: s, deletedAt: null },
      });
    }
    if (type === 'post') {
      const s = status === 'HIDDEN' ? PostStatus.HIDDEN : PostStatus.PUBLISHED;
      return this.prisma.post.count({ where: { status: s, deletedAt: null } });
    }
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async approveContent(id: string, type: string, dto: ApproveContentDto) {
    if (type === 'course') {
      const course = await this.prisma.course.findUnique({ where: { id } });
      if (!course) throw new NotFoundException('Course not found');
      return this.prisma.course.update({
        where: { id },
        data: { status: CourseStatus.PUBLISHED, publishedAt: new Date() },
      });
    }
    if (type === 'artwork') {
      const artwork = await this.prisma.artwork.findUnique({ where: { id } });
      if (!artwork) throw new NotFoundException('Artwork not found');
      return this.prisma.artwork.update({
        where: { id },
        data: { status: ArtworkStatus.PUBLISHED },
      });
    }
    if (type === 'post') {
      const post = await this.prisma.post.findUnique({ where: { id } });
      if (!post) throw new NotFoundException('Post not found');
      return this.prisma.post.update({
        where: { id },
        data: { status: PostStatus.PUBLISHED },
      });
    }
    throw new BadRequestException('Invalid content type');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async rejectContent(id: string, type: string, dto: RejectContentDto) {
    if (type === 'course') {
      const course = await this.prisma.course.findUnique({ where: { id } });
      if (!course) throw new NotFoundException('Course not found');
      return this.prisma.course.update({
        where: { id },
        data: { status: CourseStatus.DRAFT },
      });
    }
    if (type === 'artwork') {
      const artwork = await this.prisma.artwork.findUnique({ where: { id } });
      if (!artwork) throw new NotFoundException('Artwork not found');
      return this.prisma.artwork.update({
        where: { id },
        data: { status: ArtworkStatus.REJECTED },
      });
    }
    if (type === 'post') {
      const post = await this.prisma.post.findUnique({ where: { id } });
      if (!post) throw new NotFoundException('Post not found');
      return this.prisma.post.update({
        where: { id },
        data: { status: PostStatus.HIDDEN },
      });
    }
    throw new BadRequestException('Invalid content type');
  }

  async batchApprove(dto: BatchContentActionDto) {
    const results = [];
    for (const id of dto.ids) {
      try {
        // Try each type
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (course) {
          await this.approveContent(id, 'course', {});
          results.push({ id, type: 'course', success: true });
          continue;
        }
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (artwork) {
          await this.approveContent(id, 'artwork', {});
          results.push({ id, type: 'artwork', success: true });
          continue;
        }
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (post) {
          await this.approveContent(id, 'post', {});
          results.push({ id, type: 'post', success: true });
          continue;
        }
        results.push({ id, success: false, error: 'Not found' });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.push({ id, success: false, error: message });
      }
    }
    return results;
  }

  async batchReject(dto: BatchContentActionDto) {
    const results = [];
    for (const id of dto.ids) {
      try {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (course) {
          await this.rejectContent(id, 'course', {
            reason: dto.reason ?? 'Batch rejected',
          });
          results.push({ id, type: 'course', success: true });
          continue;
        }
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (artwork) {
          await this.rejectContent(id, 'artwork', {
            reason: dto.reason ?? 'Batch rejected',
          });
          results.push({ id, type: 'artwork', success: true });
          continue;
        }
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (post) {
          await this.rejectContent(id, 'post', {
            reason: dto.reason ?? 'Batch rejected',
          });
          results.push({ id, type: 'post', success: true });
          continue;
        }
        results.push({ id, success: false, error: 'Not found' });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.push({ id, success: false, error: message });
      }
    }
    return results;
  }
}
