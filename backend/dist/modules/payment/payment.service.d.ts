import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    pay(userId: string, orderId: string, method: PaymentMethod): Promise<{
        id: string;
        status: PaymentStatus;
        transactionNo: string;
        paidAt: Date;
    }>;
    getPaymentByOrder(orderId: string): Promise<{
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
    } | null>;
    private generateTransactionNo;
}
