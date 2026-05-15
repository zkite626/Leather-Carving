"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const course_service_1 = require("./course.service");
const create_course_dto_1 = require("./dto/create-course.dto");
const update_course_dto_1 = require("./dto/update-course.dto");
const query_course_dto_1 = require("./dto/query-course.dto");
const create_chapter_dto_1 = require("./dto/create-chapter.dto");
const create_lesson_dto_1 = require("./dto/create-lesson.dto");
const update_progress_dto_1 = require("./dto/update-progress.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CourseController = class CourseController {
    courseService;
    constructor(courseService) {
        this.courseService = courseService;
    }
    async findAll(query) {
        return this.courseService.findAll(query);
    }
    async getMyTeacherCourses(userId, query) {
        return this.courseService.findTeacherCourses(userId, query);
    }
    async getDashboard(userId) {
        return this.courseService.getTeacherDashboard(userId);
    }
    async findBySlug(slug) {
        return this.courseService.findBySlug(slug);
    }
    async create(userId, dto) {
        return this.courseService.create(userId, dto);
    }
    async update(id, userId, dto) {
        return this.courseService.update(id, userId, dto);
    }
    async remove(id, userId) {
        await this.courseService.remove(id, userId);
        return { message: 'Course deleted' };
    }
    async publish(id, userId) {
        return this.courseService.publish(id, userId);
    }
    async createChapter(courseId, userId, dto) {
        return this.courseService.createChapter(courseId, userId, dto);
    }
    async updateChapter(chapterId, userId, dto) {
        return this.courseService.updateChapter(chapterId, userId, dto);
    }
    async deleteChapter(chapterId, userId) {
        await this.courseService.deleteChapter(chapterId, userId);
        return { message: 'Chapter deleted' };
    }
    async reorderChapters(courseId, userId, dto) {
        await this.courseService.reorderChapters(courseId, userId, dto.chapterIds);
        return { message: 'Chapters reordered' };
    }
    async createLesson(chapterId, userId, dto) {
        return this.courseService.createLesson(chapterId, userId, dto);
    }
    async updateLesson(lessonId, userId, dto) {
        return this.courseService.updateLesson(lessonId, userId, dto);
    }
    async deleteLesson(lessonId, userId) {
        await this.courseService.deleteLesson(lessonId, userId);
        return { message: 'Lesson deleted' };
    }
    async reorderLessons(chapterId, userId, dto) {
        await this.courseService.reorderLessons(chapterId, userId, dto.lessonIds);
        return { message: 'Lessons reordered' };
    }
    async enroll(courseId, userId) {
        const enrollment = await this.courseService.enroll(userId, courseId);
        return {
            enrollmentId: enrollment.id,
            courseId: enrollment.courseId,
            status: enrollment.status,
        };
    }
    async getEnrollment(courseId, userId) {
        return this.courseService.getEnrollment(userId, courseId);
    }
    async updateProgress(lessonId, userId, dto) {
        return this.courseService.updateProgress(userId, lessonId, dto);
    }
    async getLessonProgress(lessonId, userId) {
        return this.courseService.getLessonProgress(userId, lessonId);
    }
    async getCourseProgress(courseId, userId) {
        return this.courseService.getCourseProgress(userId, courseId);
    }
};
exports.CourseController = CourseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List published courses with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_course_dto_1.QueryCourseDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get teacher own courses' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_course_dto_1.QueryCourseDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getMyTeacherCourses", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get teacher dashboard stats' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course detail by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new course' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_course_dto_1.CreateCourseDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a course (owner only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_course_dto_1.UpdateCourseDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a course (owner only, soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a course' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/chapters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a chapter to course' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_chapter_dto_1.CreateChapterDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "createChapter", null);
__decorate([
    (0, common_1.Patch)('chapters/:chapterId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a chapter' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_chapter_dto_1.UpdateChapterDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateChapter", null);
__decorate([
    (0, common_1.Delete)('chapters/:chapterId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a chapter' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "deleteChapter", null);
__decorate([
    (0, common_1.Post)(':id/chapters/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder chapters' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_chapter_dto_1.ReorderChaptersDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "reorderChapters", null);
__decorate([
    (0, common_1.Post)('chapters/:chapterId/lessons'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a lesson to chapter' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_lesson_dto_1.CreateLessonDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Patch)('lessons/:lessonId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lesson' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_lesson_dto_1.UpdateLessonDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Delete)('lessons/:lessonId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lesson' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Post)('chapters/:chapterId/lessons/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder lessons in a chapter' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_lesson_dto_1.ReorderLessonsDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "reorderLessons", null);
__decorate([
    (0, common_1.Post)(':id/enroll'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll in a course' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)(':id/enrollment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrollment status for a course' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getEnrollment", null);
__decorate([
    (0, common_1.Post)('lessons/:lessonId/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update lesson progress' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_progress_dto_1.UpdateProgressDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Get)('lessons/:lessonId/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get lesson progress' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getLessonProgress", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall course progress' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCourseProgress", null);
exports.CourseController = CourseController = __decorate([
    (0, swagger_1.ApiTags)('Courses'),
    (0, common_1.Controller)('courses'),
    __metadata("design:paramtypes", [course_service_1.CourseService])
], CourseController);
//# sourceMappingURL=course.controller.js.map