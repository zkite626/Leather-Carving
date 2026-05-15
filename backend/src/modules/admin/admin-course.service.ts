import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseQueryDto } from './dto';
import { Prisma } from '@prisma/client';

interface CreateCourseInput {
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  level?: string;
  category?: string;
  tags?: string[];
  price?: number;
  originalPrice?: number;
  isFree?: boolean;
}

@Injectable()
export class AdminCourseService {
  private readonly logger = new Logger(AdminCourseService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200) || `course-${Date.now()}`;
  }

  async createCourse(adminId: string, dto: CreateCourseInput) {
    // 确保管理员有 TeacherProfile
    let teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId: adminId },
    });
    if (!teacherProfile) {
      teacherProfile = await this.prisma.teacherProfile.create({
        data: {
          userId: adminId,
          title: '平台管理员',
          specialties: ['皮雕艺术'],
          isVerified: true,
        },
      });
    }

    const slug = this.generateSlug(dto.title);
    const existing = await this.prisma.course.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('课程 slug 已存在');

    const course = await this.prisma.course.create({
      data: {
        teacherId: teacherProfile.id,
        title: dto.title,
        slug,
        subtitle: dto.subtitle,
        description: dto.description,
        coverImage: dto.coverImage,
        level: (dto.level as never) ?? 'BEGINNER',
        category: dto.category,
        tags: dto.tags ?? [],
        price: dto.price != null ? new Prisma.Decimal(dto.price) : new Prisma.Decimal(0),
        originalPrice: dto.originalPrice != null ? new Prisma.Decimal(dto.originalPrice) : null,
        isFree: dto.isFree ?? false,
        status: 'DRAFT',
      },
      include: {
        teacher: { include: { user: { select: { nickname: true } } } },
      },
    });

    this.logger.log(`Admin created course: ${course.title} (${course.id})`);
    return {
      ...course,
      teacherName: course.teacher.user.nickname,
      price: String(course.price),
      originalPrice: course.originalPrice ? String(course.originalPrice) : null,
    };
  }

  async getCourses(query: CourseQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      ...(query.keyword && {
        OR: [
          { title: { contains: query.keyword, mode: 'insensitive' } },
          { subtitle: { contains: query.keyword, mode: 'insensitive' } },
        ],
      }),
      ...(query.status && { status: query.status as never }),
      ...(query.level && { level: query.level as never }),
    };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            include: {
              user: { select: { nickname: true, avatar: true } },
            },
          },
          _count: { select: { enrollments: true, chapters: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      items: courses.map((c) => ({
        ...c,
        teacherName: c.teacher.user.nickname,
        price: String(c.price),
        originalPrice: c.originalPrice ? String(c.originalPrice) : null,
        rating: String(c.rating),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          include: { user: { select: { nickname: true, avatar: true } } },
        },
        chapters: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course || course.deletedAt) throw new NotFoundException('课程不存在');
    return course;
  }

  async updateCourseStatus(id: string, status: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course || course.deletedAt) throw new NotFoundException('课程不存在');

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        status: status as never,
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    });

    this.logger.log(`Course ${id} status changed: ${course.status} -> ${status}`);
    return updated;
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course || course.deletedAt) throw new NotFoundException('课程不存在');

    await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Admin deleted course: ${id}`);
    return { message: '课程已删除' };
  }
}
