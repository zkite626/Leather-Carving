import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const MAX_DEPTH = 3;

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async validateEntity(
    entityType: 'artwork' | 'post',
    entityId: string,
  ) {
    if (entityType === 'artwork') {
      const artwork = await this.prisma.artwork.findUnique({
        where: { id: entityId, deletedAt: null },
      });
      if (!artwork) throw new NotFoundException('Artwork not found');
    } else if (entityType === 'post') {
      const post = await this.prisma.post.findUnique({
        where: { id: entityId, deletedAt: null },
      });
      if (!post) throw new NotFoundException('Post not found');
    } else {
      throw new BadRequestException(
        'Invalid entity type. Must be artwork or post',
      );
    }
  }

  private async checkDepth(parentId: string): Promise<number> {
    let depth = 0;
    let currentId: string | null = parentId;

    while (currentId && depth < MAX_DEPTH) {
      const row: { parentId: string | null } | null =
        await this.prisma.comment.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });
      if (!row) break;
      currentId = row.parentId;
      depth++;
    }

    return depth;
  }

  async create(
    userId: string,
    entityType: 'artwork' | 'post',
    entityId: string,
    dto: CreateCommentDto,
  ) {
    await this.validateEntity(entityType, entityId);

    let depth = 0;
    if (dto.parentId) {
      const parent: {
        id: string;
        parentId: string | null;
        artworkId: string | null;
        postId: string | null;
      } | null = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');

      // Check that parent belongs to the same entity
      if (entityType === 'artwork' && parent.artworkId !== entityId) {
        throw new BadRequestException(
          'Parent comment does not belong to this artwork',
        );
      }
      if (entityType === 'post' && parent.postId !== entityId) {
        throw new BadRequestException(
          'Parent comment does not belong to this post',
        );
      }

      depth = await this.checkDepth(dto.parentId);
      if (depth >= MAX_DEPTH - 1) {
        throw new BadRequestException(
          `Maximum reply depth of ${MAX_DEPTH} levels exceeded`,
        );
      }
    }

    const data: Prisma.CommentCreateInput = {
      user: { connect: { id: userId } },
      content: dto.content,
      ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
      ...(entityType === 'artwork'
        ? { artwork: { connect: { id: entityId } } }
        : { post: { connect: { id: entityId } } }),
    };

    const comment = await this.prisma.comment.create({
      data,
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true, role: true },
        },
      },
    });

    // Increment comment count on post
    if (entityType === 'post') {
      await this.prisma.post.update({
        where: { id: entityId },
        data: { commentCount: { increment: 1 } },
      });
    }

    this.logger.log(
      `Comment created on ${entityType}/${entityId} by user ${userId}`,
    );
    return comment;
  }

  async findByEntity(
    entityType: 'artwork' | 'post',
    entityId: string,
    page = 1,
    pageSize = 20,
  ) {
    await this.validateEntity(entityType, entityId);

    const skip = (page - 1) * pageSize;
    const where: Prisma.CommentWhereInput = {
      deletedAt: null,
      parentId: null,
      ...(entityType === 'artwork'
        ? { artworkId: entityId }
        : { postId: entityId }),
    };

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: pageSize,
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
                },
              },
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    // Decrement comment count on post
    if (comment.postId) {
      await this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      });
    }
  }
}
