import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import {
  CreateChapterDto,
  UpdateChapterDto,
  ReorderChaptersDto,
} from './dto/create-chapter.dto';
import {
  CreateLessonDto,
  UpdateLessonDto,
  ReorderLessonsDto,
} from './dto/create-lesson.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // ==================== Course Endpoints ====================

  @Get()
  @ApiOperation({ summary: 'List published courses with filters' })
  async findAll(@Query() query: QueryCourseDto) {
    return this.courseService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher own courses' })
  async getMyTeacherCourses(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryCourseDto,
  ) {
    return this.courseService.findTeacherCourses(userId, query);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher dashboard stats' })
  async getDashboard(@CurrentUser('sub') userId: string) {
    return this.courseService.getTeacherDashboard(userId);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get course detail by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.courseService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course (owner only)' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course (owner only, soft delete)' })
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.courseService.remove(id, userId);
    return { message: 'Course deleted' };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a course' })
  async publish(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.courseService.publish(id, userId);
  }

  // ==================== Chapter Endpoints ====================

  @Post(':id/chapters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a chapter to course' })
  async createChapter(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateChapterDto,
  ) {
    return this.courseService.createChapter(courseId, userId, dto);
  }

  @Patch('chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a chapter' })
  async updateChapter(
    @Param('chapterId') chapterId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.courseService.updateChapter(chapterId, userId, dto);
  }

  @Delete('chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a chapter' })
  async deleteChapter(
    @Param('chapterId') chapterId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.courseService.deleteChapter(chapterId, userId);
    return { message: 'Chapter deleted' };
  }

  @Post(':id/chapters/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder chapters' })
  async reorderChapters(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ReorderChaptersDto,
  ) {
    await this.courseService.reorderChapters(courseId, userId, dto.chapterIds);
    return { message: 'Chapters reordered' };
  }

  // ==================== Lesson Endpoints ====================

  @Post('chapters/:chapterId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a lesson to chapter' })
  async createLesson(
    @Param('chapterId') chapterId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.courseService.createLesson(chapterId, userId, dto);
  }

  @Patch('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lesson' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.courseService.updateLesson(lessonId, userId, dto);
  }

  @Delete('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.courseService.deleteLesson(lessonId, userId);
    return { message: 'Lesson deleted' };
  }

  @Post('chapters/:chapterId/lessons/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder lessons in a chapter' })
  async reorderLessons(
    @Param('chapterId') chapterId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ReorderLessonsDto,
  ) {
    await this.courseService.reorderLessons(chapterId, userId, dto.lessonIds);
    return { message: 'Lessons reordered' };
  }

  // ==================== Enrollment Endpoints ====================

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll in a course' })
  async enroll(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const enrollment = await this.courseService.enroll(userId, courseId);
    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      status: enrollment.status,
    };
  }

  @Get(':id/enrollment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrollment status for a course' })
  async getEnrollment(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.courseService.getEnrollment(userId, courseId);
  }

  // ==================== Progress Endpoints ====================

  @Post('lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lesson progress' })
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.courseService.updateProgress(userId, lessonId, dto);
  }

  @Get('lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lesson progress' })
  async getLessonProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.courseService.getLessonProgress(userId, lessonId);
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get overall course progress' })
  async getCourseProgress(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.courseService.getCourseProgress(userId, courseId);
  }
}
