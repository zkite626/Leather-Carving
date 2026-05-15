import { OrderStatus } from '@prisma/client';
export declare class OrderItemInput {
    productId: string;
    quantity: number;
}
export declare class OrderAddressInput {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
}
export declare class CreateOrderDto {
    items: OrderItemInput[];
    address: OrderAddressInput;
    remark?: string;
}
export declare class QueryOrderDto {
    page?: number;
    pageSize?: number;
    status?: OrderStatus;
}
