import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';
import { UserService } from '../../user/user.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
    jti: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userService;
    private readonly config;
    constructor(userService: UserService, config: ConfigService);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
