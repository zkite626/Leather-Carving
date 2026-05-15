export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
    requestId: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginationQuery {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
