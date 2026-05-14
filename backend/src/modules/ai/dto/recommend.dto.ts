import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecommendDto {
  @ApiPropertyOptional({ description: 'User preferences or interests' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  preferences?: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  limit?: number;
}
