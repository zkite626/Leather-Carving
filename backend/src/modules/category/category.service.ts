import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.productCategory.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: true } },
            children: {
              orderBy: { sortOrder: 'asc' },
              include: {
                _count: { select: { products: true } },
              },
            },
          },
        },
      },
    });

    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.productCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.prisma.productCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    this.logger.log(`Category created: ${category.id}`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const isDescendant = await this.isDescendant(id, dto.parentId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot set a descendant as parent (circular reference)',
        );
      }

      const parent = await this.prisma.productCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.productCategory.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder,
      },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with children. Remove children first.',
      );
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        'Cannot delete category with products. Reassign products first.',
      );
    }

    await this.prisma.productCategory.delete({ where: { id } });
  }

  private async isDescendant(
    ancestorId: string,
    candidateDescendantId: string,
  ): Promise<boolean> {
    const children = await this.prisma.productCategory.findMany({
      where: { parentId: ancestorId },
      select: { id: true },
    });

    for (const child of children) {
      if (child.id === candidateDescendantId) {
        return true;
      }
      const found = await this.isDescendant(child.id, candidateDescendantId);
      if (found) return true;
    }

    return false;
  }
}
