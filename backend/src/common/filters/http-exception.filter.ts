import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  code: number;
  message: string;
  error: string;
  timestamp: string;
  requestId: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: string;
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exceptionResponse;
    } else if (
      exceptionResponse !== null &&
      typeof exceptionResponse === 'object'
    ) {
      const resp = exceptionResponse as Record<string, unknown>;
      message =
        typeof resp['message'] === 'string'
          ? resp['message']
          : Array.isArray(resp['message'])
            ? (resp['message'] as string[]).join('; ')
            : 'Internal server error';
      error = typeof resp['error'] === 'string' ? resp['error'] : 'Error';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    } else {
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    const requestId = (request.headers['x-request-id'] as string) ?? 'unknown';

    const errorResponse: ErrorResponse = {
      code: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      requestId,
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(errorResponse);
  }
}
