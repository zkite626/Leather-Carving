import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SmtpConfigDto {
  @ApiProperty({ example: 'smtp.qq.com' })
  @IsString()
  @MaxLength(200)
  host!: string;

  @ApiProperty({ example: 465 })
  @IsNumber()
  port!: number;

  @ApiPropertyOptional({ example: 'your-email@qq.com' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  username?: string;

  @ApiPropertyOptional({ example: 'your-smtp-password' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  password?: string;

  @ApiProperty({ example: 'your-email@qq.com' })
  @IsString()
  @MaxLength(200)
  fromAddress!: string;

  @ApiPropertyOptional({ example: '艺育皮韵' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fromName?: string;

  @ApiPropertyOptional({ example: 'ssl', default: 'ssl' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  encryption?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
