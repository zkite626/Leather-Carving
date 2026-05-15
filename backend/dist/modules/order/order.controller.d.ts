import { PaymentMethod } from '@prisma/client';
import { OrderService } from './order.service';
import { PaymentService } from '../payment/payment.service';
import { CreateOrderDto, QueryOrderDto } from './dto/create-order.dto';
export declare class OrderController {
    private readonly orderService;
    private readonly paymentService;
    constructor(orderService: OrderService, paymentService: PaymentService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        payAmount: import("@prisma/client-runtime-utils").Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    findAll(userId: string, query: QueryOrderDto): Promise<{
        data: ({
            items: ({
                product: {
                    name: string;
                    id: string;
                    coverImage: string | null;
                };
            } & {
                productImage: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client-runtime-utils").Decimal;
                productId: string;
                quantity: number;
                productName: string;
                orderId: string;
            })[];
        } & {
            address: import("@prisma/client/runtime/client").JsonValue;
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            completedAt: Date | null;
            orderNo: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            payAmount: import("@prisma/client-runtime-utils").Decimal;
            remark: string | null;
            paidAt: Date | null;
            shippedAt: Date | null;
            cancelledAt: Date | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(userId: string, id: string): Promise<{
        items: ({
            product: {
                name: string;
                id: string;
                coverImage: string | null;
            };
        } & {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        })[];
        payments: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            paidAt: Date | null;
            orderId: string;
            transactionNo: string | null;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            rawData: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
        address: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        payAmount: import("@prisma/client-runtime-utils").Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    pay(userId: string, id: string, method?: PaymentMethod): Promise<{
        id: string;
        status: import("@prisma/client").PaymentStatus;
        transactionNo: string;
        paidAt: Date;
    }>;
    cancel(userId: string, id: string): Promise<{
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        payAmount: import("@prisma/client-runtime-utils").Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    confirmReceipt(userId: string, id: string): Promise<{
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        payAmount: import("@prisma/client-runtime-utils").Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
}
