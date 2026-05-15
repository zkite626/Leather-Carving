import type { IUserPublic } from './user';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
export type CourseStatus = 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'ARCHIVED';
export type LessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'PRACTICE';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
export interface ICourse {
    id: string;
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    coverImage?: string;
    level: CourseLevel;
    category?: string;
    tags: string[];
    price: number;
    originalPrice?: number;
    isFree: boolean;
    status: CourseStatus;
    teacher: IUserPublic;
    totalDuration: number;
    totalLessons: number;
    enrollCount: number;
    rating: number;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface IChapter {
    id: string;
    courseId: string;
    title: string;
    sortOrder: number;
    lessons: ILesson[];
}
export interface ILesson {
    id: string;
    chapterId: string;
    title: string;
    type: LessonType;
    content?: string;
    videoUrl?: string;
    duration: number;
    isFreePreview: boolean;
    sortOrder: number;
    attachments?: Record<string, unknown>;
}
export interface IEnrollment {
    id: string;
    userId: string;
    courseId: string;
    status: EnrollmentStatus;
    progress: number;
    enrolledAt: string;
    completedAt?: string;
    expiredAt?: string;
}
export interface ILessonProgress {
    id: string;
    enrollmentId: string;
    lessonId: string;
    isCompleted: boolean;
    watchedDuration: number;
    lastPosition: number;
    completedAt?: string;
}
