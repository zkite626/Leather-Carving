import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentReviewQueryDto, ApproveContentDto, RejectContentDto, BatchContentActionDto } from './dto';
import { CourseStatus, ArtworkStatus, PostStatus } from '@prisma/client';

@Injectable()
export class AdminContentService {
  private readonly logger = new Logger(AdminContentService.name);

  constructor(private readonly prisma: PrismaService) {}

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
      const courseStatus = status === 'REVIEWING' ? CourseStatus.REVIEWING : status === 'PUBLISHED' ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;
      if (status !== 'REJECTED') {
        const courses = await this.prisma.course.findMany({
          where: { status: courseStatus, deletedAt: null },
          skip: type === 'course' ? skip : 0,
          take: type === 'course' ? pageSize : 50,
          include: {
            teacher: { include: { user: { select: { id: true, nickname: true, avatar: true } } } },
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
      const artworkStatus = status === 'REVIEWING' ? ArtworkStatus.REVIEWING : status === 'PUBLISHED' ? ArtworkStatus.PUBLISHED : ArtworkStatus.REJECTED;
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
      const postStatus = status === 'HIDDEN' ? PostStatus.HIDDEN : status === 'PUBLISHED' ? PostStatus.PUBLISHED : PostStatus.PUBLISHED;
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
    const paginatedResults = type === 'all' ? results.slice(skip, skip + pageSize) : results;
    const totalAll = type === 'all' ? total : await this.getTotalCount(type, status);

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

  private async getTotalCount(type: string, status: string): Promise<number> {
    if (type === 'course') {
      const s = status === 'REVIEWING' ? CourseStatus.REVIEWING : status === 'PUBLISHED' ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;
      return this.prisma.course.count({ where: { status: s, deletedAt: null } });
    }
    if (type === 'artwork') {
      const s = status === 'REVIEWING' ? ArtworkStatus.REVIEWING : status === 'PUBLISHED' ? ArtworkStatus.PUBLISHED : ArtworkStatus.REJECTED;
      return this.prisma.artwork.count({ where: { status: s, deletedAt: null } });
    }
    if (type === 'post') {
      const s = status === 'HIDDEN' ? PostStatus.HIDDEN : PostStatus.PUBLISHED;
      return this.prisma.post.count({ where: { status: s, deletedAt: null } });
    }
    return 0;
  }

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
          const result = await this.approveContent(id, 'course', {});
          results.push({ id, type: 'course', success: true });
          continue;
        }
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (artwork) {
          const result = await this.approveContent(id, 'artwork', {});
          results.push({ id, type: 'artwork', success: true });
          continue;
        }
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (post) {
          const result = await this.approveContent(id, 'post', {});
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
          await this.rejectContent(id, 'course', { reason: dto.reason ?? 'Batch rejected' });
          results.push({ id, type: 'course', success: true });
          continue;
        }
        const artwork = await this.prisma.artwork.findUnique({ where: { id } });
        if (artwork) {
          await this.rejectContent(id, 'artwork', { reason: dto.reason ?? 'Batch rejected' });
          results.push({ id, type: 'artwork', success: true });
          continue;
        }
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (post) {
          await this.rejectContent(id, 'post', { reason: dto.reason ?? 'Batch rejected' });
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
