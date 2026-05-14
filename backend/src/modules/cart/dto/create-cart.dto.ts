import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID', example: 'uuid-string' })
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'Quantity to add',
    minimum: 1,
    maximum: 99,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number = 1;
}

export class UpdateCartDto {
  @ApiProperty({ description: 'New quantity', minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
