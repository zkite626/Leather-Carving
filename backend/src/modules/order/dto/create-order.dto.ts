import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
  IsInt,
  Min,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderItemInput {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class OrderAddressInput {
  @ApiProperty({ description: 'Recipient name' })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ description: 'Province' })
  @IsString()
  @MaxLength(50)
  province!: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MaxLength(50)
  city!: string;

  @ApiProperty({ description: 'District' })
  @IsString()
  @MaxLength(50)
  district!: string;

  @ApiProperty({ description: 'Detail address' })
  @IsString()
  @MaxLength(200)
  detail!: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInput], description: 'Order items' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items!: OrderItemInput[];

  @ApiProperty({ type: OrderAddressInput, description: 'Shipping address' })
  @ValidateNested()
  @Type(() => OrderAddressInput)
  address!: OrderAddressInput;

  @ApiPropertyOptional({ description: 'Order remark' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class QueryOrderDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
