import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePatternDto,
  UpdatePatternDto,
  QueryPatternDto,
} from './dto/pattern.dto';

@Injectable()
export class PatternService {
  private readonly logger = new Logger(PatternService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatternDto) {
    const pattern = await this.prisma.patternAsset.create({
      data: {
        name: dto.name,
        category: dto.category,
        imageUrl: dto.imageUrl,
        thumbnailUrl: dto.thumbnailUrl,
        description: dto.description,
        origin: dto.origin,
        tags: dto.tags ?? [],
      },
    });

    this.logger.log(`PatternAsset created: ${pattern.id}`);
    return pattern;
  }

  async findAll(query: QueryPatternDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    const [patterns, total] = await Promise.all([
      this.prisma.patternAsset.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patternAsset.count({ where }),
    ]);

    return {
      data: patterns,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const pattern = await this.prisma.patternAsset.findUnique({
      where: { id },
    });
    if (!pattern) throw new NotFoundException('Pattern not found');
    return pattern;
  }

  async update(id: string, dto: UpdatePatternDto) {
    const pattern = await this.prisma.patternAsset.findUnique({
      where: { id },
    });
    if (!pattern) throw new NotFoundException('Pattern not found');

    return this.prisma.patternAsset.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        imageUrl: dto.imageUrl,
        thumbnailUrl: dto.thumbnailUrl,
        description: dto.description,
        origin: dto.origin,
        tags: dto.tags,
      },
    });
  }

  async remove(id: string) {
    const pattern = await this.prisma.patternAsset.findUnique({
      where: { id },
    });
    if (!pattern) throw new NotFoundException('Pattern not found');

    await this.prisma.patternAsset.delete({ where: { id } });
  }

  async incrementDownload(id: string) {
    return this.prisma.patternAsset.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }
}
