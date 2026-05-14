import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type {
  ICourse,
  IChapter,
  ILesson,
  IEnrollment,
  ILessonProgress,
  CourseLevel,
} from '@/shared/types/course';
import type { IReview } from '@/shared/types/community';

export interface CourseQuery {
  page?: number;
  pageSize?: number;
  level?: CourseLevel;
  category?: string;
  isFree?: boolean;
  keyword?: string;
  sortBy?: 'createdAt' | 'enrollCount' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseDetail extends ICourse {
  chapters: IChapter[];
  reviews: IReview[];
  teacher: ICourse['teacher'] & {
    profile?: {
      title: string;
      specialties: string[];
      experience: number;
      introduction?: string;
      isVerified: boolean;
    };
    courseCount: number;
  };
  reviewSummary: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
}

export interface CreateCourseData {
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  level: CourseLevel;
  category?: string;
  tags?: string[];
  price?: number;
  originalPrice?: number;
  isFree?: boolean;
}

export interface CreateChapterData {
  title: string;
  sortOrder?: number;
}

export interface CreateLessonData {
  title: string;
  type: ILesson['type'];
  content?: string;
  videoUrl?: string;
  duration?: number;
  isFreePreview?: boolean;
  sortOrder?: number;
}

export interface TeacherDashboard {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  avgRating: number;
  recentEnrollments: Array<{
    id: string;
    enrolledAt: string;
    user: { id: string; nickname: string; avatar?: string };
    course: { id: string; title: string; slug: string };
  }>;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

// ==================== Course API ====================

export async function getCourses(query: CourseQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.level) params.set('level', query.level);
  if (query.category) params.set('category', query.category);
  if (query.isFree !== undefined) params.set('isFree', String(query.isFree));
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const res = await apiClient.get<PaginatedResponse<ICourse>>(
    `/courses?${params.toString()}`,
  );
  return res.data;
}

export async function getCourseBySlug(slug: string) {
  const res = await apiClient.get<ApiResponse<CourseDetail>>(`/courses/${slug}`);
  return res.data.data;
}

export async function getCourseById(id: string) {
  const res = await apiClient.get<ApiResponse<ICourse & { chapters: IChapter[] }>>(
    `/courses/${id}`,
  );
  return res.data.data;
}

export async function createCourse(data: CreateCourseData) {
  const res = await apiClient.post<ApiResponse<ICourse>>('/courses', data);
  return res.data.data;
}

export async function updateCourse(id: string, data: Partial<CreateCourseData>) {
  const res = await apiClient.patch<ApiResponse<ICourse>>(`/courses/${id}`, data);
  return res.data.data;
}

export async function deleteCourse(id: string) {
  await apiClient.delete(`/courses/${id}`);
}

export async function publishCourse(id: string) {
  const res = await apiClient.post<ApiResponse<ICourse>>(`/courses/${id}/publish`);
  return res.data.data;
}

// ==================== Chapter API ====================

export async function createChapter(courseId: string, data: CreateChapterData) {
  const res = await apiClient.post<ApiResponse<IChapter>>(
    `/courses/${courseId}/chapters`,
    data,
  );
  return res.data.data;
}

export async function updateChapter(chapterId: string, data: Partial<CreateChapterData>) {
  const res = await apiClient.patch<ApiResponse<IChapter>>(
    `/courses/chapters/${chapterId}`,
    data,
  );
  return res.data.data;
}

export async function deleteChapter(chapterId: string) {
  await apiClient.delete(`/courses/chapters/${chapterId}`);
}

export async function reorderChapters(courseId: string, chapterIds: string[]) {
  await apiClient.post(`/courses/${courseId}/chapters/reorder`, { chapterIds });
}

// ==================== Lesson API ====================

export async function createLesson(chapterId: string, data: CreateLessonData) {
  const res = await apiClient.post<ApiResponse<ILesson>>(
    `/courses/chapters/${chapterId}/lessons`,
    data,
  );
  return res.data.data;
}

export async function updateLesson(lessonId: string, data: Partial<CreateLessonData>) {
  const res = await apiClient.patch<ApiResponse<ILesson>>(
    `/courses/lessons/${lessonId}`,
    data,
  );
  return res.data.data;
}

export async function deleteLesson(lessonId: string) {
  await apiClient.delete(`/courses/lessons/${lessonId}`);
}

export async function reorderLessons(chapterId: string, lessonIds: string[]) {
  await apiClient.post(`/courses/chapters/${chapterId}/lessons/reorder`, { lessonIds });
}

// ==================== Enrollment API ====================

export async function enrollCourse(courseId: string) {
  const res = await apiClient.post<ApiResponse<IEnrollment>>(
    `/courses/${courseId}/enroll`,
  );
  return res.data.data;
}

export async function getEnrollment(courseId: string) {
  const res = await apiClient.get<ApiResponse<IEnrollment | null>>(
    `/courses/${courseId}/enrollment`,
  );
  return res.data.data;
}

export async function getMyCourses(page = 1, pageSize = 20) {
  const res = await apiClient.get<
    PaginatedResponse<IEnrollment & { course: ICourse }>
  >(`/courses/my?page=${page}&pageSize=${pageSize}`);
  return res.data;
}

// ==================== Progress API ====================

export async function updateLessonProgress(
  lessonId: string,
  data: { watchedDuration: number; lastPosition: number; isCompleted?: boolean },
) {
  const res = await apiClient.post<ApiResponse<ILessonProgress>>(
    `/courses/lessons/${lessonId}/progress`,
    data,
  );
  return res.data.data;
}

export async function getLessonProgress(lessonId: string) {
  const res = await apiClient.get<ApiResponse<ILessonProgress | null>>(
    `/courses/lessons/${lessonId}/progress`,
  );
  return res.data.data;
}

export async function getCourseProgress(courseId: string) {
  const res = await apiClient.get<
    ApiResponse<(IEnrollment & { lessonProgresses: ILessonProgress[] }) | null>
  >(`/courses/${courseId}/progress`);
  return res.data.data;
}

// ==================== Teacher API ====================

export async function getTeacherCourses(query: CourseQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.keyword) params.set('keyword', query.keyword);

  const res = await apiClient.get<PaginatedResponse<ICourse>>(
    `/courses/my?${params.toString()}`,
  );
  return res.data;
}

export async function getTeacherDashboard() {
  const res = await apiClient.get<ApiResponse<TeacherDashboard>>('/courses/dashboard');
  return res.data.data;
}

// ==================== Review API ====================

export async function getCourseReviews(courseId: string, page = 1, pageSize = 10) {
  const res = await apiClient.get<PaginatedResponse<IReview>>(
    `/reviews/courses/${courseId}?page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
}

export async function createCourseReview(
  courseId: string,
  data: { rating: number; content?: string; images?: string[] },
) {
  const res = await apiClient.post<ApiResponse<IReview>>(
    `/reviews/courses/${courseId}`,
    data,
  );
  return res.data.data;
}

export async function getCourseReviewSummary(courseId: string) {
  const res = await apiClient.get<ApiResponse<ReviewSummary>>(
    `/reviews/courses/${courseId}/summary`,
  );
  return res.data.data;
}
