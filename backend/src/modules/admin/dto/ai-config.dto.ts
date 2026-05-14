import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAiConfigDto {
  @ApiProperty()
  @IsString()
  capability!: string;

  @ApiProperty()
  @IsString()
  providerType!: string;

  @ApiProperty()
  @IsString()
  displayName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty()
  @IsString()
  modelName!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  extraParams?: Record<string, unknown>;
}

export class UpdateAiConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capability?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  extraParams?: Record<string, unknown>;
}

export class TestAiConfigDto {
  @ApiProperty()
  @IsString()
  id!: string;
}
