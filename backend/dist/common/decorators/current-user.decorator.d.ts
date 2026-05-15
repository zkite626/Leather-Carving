interface RequestUser {
    sub: string;
    email: string;
    role: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof RequestUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
export {};
