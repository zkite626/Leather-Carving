import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '2h') as
            | number
            | `${number}s`
            | `${number}m`
            | `${number}h`
            | `${number}d`,
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
