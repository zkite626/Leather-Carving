"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof common_1.HttpException ? exception.getResponse() : null;
        let message;
        let error;
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
            error = exceptionResponse;
        }
        else if (exceptionResponse !== null &&
            typeof exceptionResponse === 'object') {
            const resp = exceptionResponse;
            message =
                typeof resp['message'] === 'string'
                    ? resp['message']
                    : Array.isArray(resp['message'])
                        ? resp['message'].join('; ')
                        : 'Internal server error';
            error = typeof resp['error'] === 'string' ? resp['error'] : 'Error';
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        else {
            message = 'Internal server error';
            error = 'Internal Server Error';
        }
        const requestId = request.headers['x-request-id'] ?? 'unknown';
        const errorResponse = {
            code: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            requestId,
            path: request.url,
        };
        if (status >= 500) {
            this.logger.error(`${request.method} ${request.url} ${status}`, exception instanceof Error ? exception.stack : undefined);
        }
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map