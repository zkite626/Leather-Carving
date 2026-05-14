import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.WECHAT,
    description: 'Payment method',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId!: string;
}
