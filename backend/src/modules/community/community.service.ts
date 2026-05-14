import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, PostType } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    pageSize?: number;
    type?: PostType;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 20,
      type,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { deletedAt: null, status: 'PUBLISHED' };
    if (type) where.type = type;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        { tags: { has: keyword } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ isPinned: 'desc' }, { [sortBy]: sortOrder }],
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true, role: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const mapped = posts.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      content: p.content,
      images: p.images,
      tags: p.tags,
      viewCount: p.viewCount,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      isPinned: p.isPinned,
      status: p.status,
      createdAt: p.createdAt,
      author: p.user,
    }));

    return {
      data: mapped,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: post.id,
      type: post.type,
      title: post.title,
      content: post.content,
      images: post.images,
      tags: post.tags,
      viewCount: post.viewCount + 1,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      isPinned: post.isPinned,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user,
    };
  }

  async create(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        images: dto.images || [],
        tags: dto.tags || [],
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
      },
    });

    this.logger.log(`Post created: ${post.id} by user ${userId}`);
    return {
      id: post.id,
      type: post.type,
      title: post.title,
      content: post.content,
      images: post.images,
      tags: post.tags,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      isPinned: post.isPinned,
      status: post.status,
      createdAt: post.createdAt,
      author: post.user,
    };
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('You can only edit your own posts');

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
        ...(dto.images && { images: dto.images }),
        ...(dto.tags && { tags: dto.tags }),
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
      },
    });

    return {
      id: updated.id,
      type: updated.type,
      title: updated.title,
      content: updated.content,
      images: updated.images,
      tags: updated.tags,
      viewCount: updated.viewCount,
      likeCount: updated.likeCount,
      commentCount: updated.commentCount,
      isPinned: updated.isPinned,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      author: updated.user,
    };
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('You can only delete your own posts');

    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Post deleted: ${id} by user ${userId}`);
  }

  async getHotTopics(limit = 10) {
    const posts = await this.prisma.post.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      orderBy: { likeCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        type: true,
        likeCount: true,
        commentCount: true,
        viewCount: true,
      },
    });

    return posts;
  }

  async getChallengeCheckins(userId: string, postId: string) {
    // Challenge check-in tracking via favorites as a marker
    const checkins = await this.prisma.favorite.findMany({
      where: { userId, entityType: 'post_checkin', entityId: postId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate consecutive days
    let consecutiveDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].createdAt);
      checkinDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (checkinDate.getTime() === expectedDate.getTime()) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return {
      totalCheckins: checkins.length,
      consecutiveDays,
      lastCheckin: checkins[0]?.createdAt || null,
    };
  }

  async checkin(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.type !== 'CHALLENGE') {
      throw new ForbiddenException('This post is not a challenge');
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId,
        entityType: 'post_checkin',
        entityId: postId,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    if (existing) {
      return { message: 'Already checked in today', checkedIn: true };
    }

    await this.prisma.favorite.create({
      data: { userId, entityType: 'post_checkin', entityId: postId },
    });

    this.logger.log(`User ${userId} checked in on challenge ${postId}`);
    return { message: 'Check-in successful', checkedIn: true };
  }
}
