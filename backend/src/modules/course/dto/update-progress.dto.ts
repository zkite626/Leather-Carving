import { IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ description: '已观看时长（秒）' })
  @IsInt()
  @Min(0)
  watchedDuration!: number;

  @ApiProperty({ description: '上次播放位置（秒）' })
  @IsInt()
  @Min(0)
  lastPosition!: number;

  @ApiPropertyOptional({ description: '是否标记完成' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
