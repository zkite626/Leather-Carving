import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({ example: 'StrongPass1' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password!: string;

  @ApiProperty({ example: '张三', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2, { message: 'Nickname must be at least 2 characters long' })
  @MaxLength(20, { message: 'Nickname must not exceed 20 characters' })
  nickname!: string;

  @ApiPropertyOptional({ example: '13800000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
