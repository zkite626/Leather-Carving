import { PrismaService } from '../prisma/prisma.service';
import { FinanceQueryDto } from './dto';
export declare class AdminFinanceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getFinanceSummary(): Promise<{
        totalRevenue: number;
        monthlyRevenue: number;
        monthGrowth: number;
        orderCount: number;
        paidOrderCount: number;
        averageOrderValue: number;
    }>;
    getTransactions(query: FinanceQueryDto): Promise<{
        items: ({
            order: {
                user: {
                    id: string;
                    email: string;
                    nickname: string;
                };
                items: {
                    price: import("@prisma/client-runtime-utils").Decimal;
                    quantity: number;
                    productName: string;
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
            };
        } & {
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
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMerchantSettlements(): Promise<{
        totalAmount: number;
        orderCount: number;
        merchantId: string;
        nickname: string;
        email: string;
    }[]>;
}
