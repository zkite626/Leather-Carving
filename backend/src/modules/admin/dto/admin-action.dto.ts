import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class RejectContentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  reason!: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['SHIPPING', 'COMPLETED', 'CANCELLED', 'REFUNDED'] })
  @IsString()
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingNo?: string;
}

export class BatchContentActionDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  ids!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password!: string;

  @ApiProperty({ example: '张三' })
  @IsString()
  nickname!: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.LEARNER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}
