import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtworkDto {
  @ApiProperty({ example: '壮锦纹样皮雕作品' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: '以壮锦传统纹样为灵感创作的皮雕作品' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '壮锦' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: ['镂刻', '印花'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techniques?: string[];

  @ApiPropertyOptional({ example: ['牛皮', '羊皮'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '创作故事 (Markdown)' })
  @IsOptional()
  @IsString()
  story?: string;
}

export class UpdateArtworkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techniques?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  story?: string;
}

export class QueryArtworkDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  techniques?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'likeCount' | 'viewCount';
}
