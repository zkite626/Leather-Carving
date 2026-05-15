import { CourseLevel } from '@prisma/client';
export declare class CreateCourseDto {
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
