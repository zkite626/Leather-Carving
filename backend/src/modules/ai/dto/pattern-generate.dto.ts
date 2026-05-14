import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatternGenerateDto {
  @ApiProperty({ example: '以蝴蝶和花卉为主题的壮锦纹样' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  prompt!: string;

  @ApiPropertyOptional({ enum: ['zhuangjin', 'yaozu', 'karst', 'modern'] })
  @IsOptional()
  @IsEnum(['zhuangjin', 'yaozu', 'karst', 'modern'])
  style?: string;

  @ApiPropertyOptional({ enum: ['512x512', '1024x1024'], default: '1024x1024' })
  @IsOptional()
  @IsEnum(['512x512', '1024x1024'])
  size?: string;
}
