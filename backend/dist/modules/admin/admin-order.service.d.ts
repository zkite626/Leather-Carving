import { PrismaService } from '../prisma/prisma.service';
import { OrderQueryDto, UpdateOrderStatusDto } from './dto';
import { Prisma } from '@prisma/client';
export declare class AdminOrderService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOrders(query: OrderQueryDto): Promise<{
        items: ({
            user: {
                id: string;
                email: string;
                nickname: string;
                avatar: string | null;
            };
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
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            nickname: string;
        };
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
}
