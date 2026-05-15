import { LessonType } from '@prisma/client';
export declare class CreateLessonDto {
    title: string;
    type: LessonType;
    content?: string;
    videoUrl?: string;
    duration?: number;
    isFreePreview?: boolean;
    sortOrder?: number;
}
export declare class UpdateLessonDto {
    title?: string;
    type?: LessonType;
    content?: string;
    videoUrl?: string;
    duration?: number;
    isFreePreview?: boolean;
    sortOrder?: number;
}
export declare class ReorderLessonsDto {
    lessonIds: string[];
}
