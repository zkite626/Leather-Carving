import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Recipient name', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ description: 'Phone number', example: '13800138000' })
  @IsString()
  @MaxLength(20)
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid Chinese phone number' })
  phone!: string;

  @ApiProperty({ description: 'Province', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  province!: string;

  @ApiProperty({ description: 'City', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  city!: string;

  @ApiProperty({ description: 'District', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  district!: string;

  @ApiProperty({ description: 'Detailed address', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  detail!: string;

  @ApiPropertyOptional({ description: 'Set as default address', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'Recipient name', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '13800138000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid Chinese phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Province', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  province?: string;

  @ApiPropertyOptional({ description: 'City', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ description: 'District', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  district?: string;

  @ApiPropertyOptional({ description: 'Detailed address', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  detail?: string;

  @ApiPropertyOptional({ description: 'Set as default address' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
