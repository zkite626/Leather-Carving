"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentService = PaymentService_1 = class PaymentService {
    prisma;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pay(userId, orderId, method) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== client_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Order is not in pending status');
        }
        if (method !== client_1.PaymentMethod.WECHAT && method !== client_1.PaymentMethod.ALIPAY) {
            throw new common_1.BadRequestException('Invalid payment method. Supported: WECHAT, ALIPAY');
        }
        const transactionNo = this.generateTransactionNo();
        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    orderId,
                    method,
                    amount: order.payAmount,
                    status: client_1.PaymentStatus.SUCCESS,
                    transactionNo,
                    paidAt: new Date(),
                },
            });
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.PAID,
                    paidAt: new Date(),
                },
            });
            return payment;
        });
        this.logger.log(`Payment successful: ${result.id}, order: ${orderId}, method: ${method}, txn: ${transactionNo}`);
        return {
            id: result.id,
            status: result.status,
            transactionNo,
            paidAt: result.paidAt,
        };
    }
    async getPaymentByOrder(orderId) {
        return this.prisma.payment.findFirst({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
    }
    generateTransactionNo() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `TXN${timestamp}${random}`;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map