import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PostType {
  DISCUSSION = 'DISCUSSION',
  SHOWCASE = 'SHOWCASE',
  QUESTION = 'QUESTION',
  TUTORIAL = 'TUTORIAL',
  CHALLENGE = 'CHALLENGE',
}

export class CreatePostDto {
  @ApiProperty({ enum: PostType, default: PostType.DISCUSSION })
  @IsEnum(PostType)
  type!: PostType;

  @ApiProperty({ example: '壮锦纹样的历史与演变' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: '# 壮锦纹样\n\n壮锦是中国四大名锦之一...' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({ example: ['https://example.com/img1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['壮锦', '纹样', '非遗'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
