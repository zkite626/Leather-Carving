import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    method?: PaymentMethod;
    orderId: string;
}
