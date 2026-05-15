import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    return payload;
  }
}
