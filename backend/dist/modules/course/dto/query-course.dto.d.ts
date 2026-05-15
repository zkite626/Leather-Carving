import { CourseLevel } from '@prisma/client';
import { PaginationQuery } from '../../../shared/types/api';
export declare class QueryCourseDto implements PaginationQuery {
    page?: number;
    pageSize?: number;
    level?: CourseLevel;
    category?: string;
    isFree?: boolean;
    keyword?: string;
    sortBy?: 'createdAt' | 'enrollCount' | 'rating' | 'price';
    sortOrder?: 'asc' | 'desc';
}
