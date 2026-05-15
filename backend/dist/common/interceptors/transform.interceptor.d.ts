import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
    requestId: string;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>>;
}
export {};
