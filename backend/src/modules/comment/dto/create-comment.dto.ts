import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: '这件作品的纹样真精美！' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for replies (max 3 levels)',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
