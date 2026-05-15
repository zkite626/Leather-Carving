import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, QueryOrderDto } from './dto/create-order.dto';
export declare class OrderService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: Prisma.Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: Prisma.JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: Prisma.Decimal;
        payAmount: Prisma.Decimal;
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
                price: Prisma.Decimal;
                productId: string;
                quantity: number;
                productName: string;
                orderId: string;
            })[];
        } & {
            address: Prisma.JsonValue;
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            completedAt: Date | null;
            orderNo: string;
            totalAmount: Prisma.Decimal;
            payAmount: Prisma.Decimal;
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
    findOne(userId: string, orderId: string): Promise<{
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
            price: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            rawData: Prisma.JsonValue | null;
        }[];
    } & {
        address: Prisma.JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: Prisma.Decimal;
        payAmount: Prisma.Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    cancel(userId: string, orderId: string): Promise<{
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: Prisma.Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: Prisma.JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: Prisma.Decimal;
        payAmount: Prisma.Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    confirmReceipt(userId: string, orderId: string): Promise<{
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: Prisma.Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: Prisma.JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: Prisma.Decimal;
        payAmount: Prisma.Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    updateStatus(orderId: string, status: OrderStatus, data?: {
        shippedAt?: Date;
        completedAt?: Date;
        cancelledAt?: Date;
    }): Promise<{
        address: Prisma.JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: Prisma.Decimal;
        payAmount: Prisma.Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    generateOrderNo(): Promise<string>;
}
