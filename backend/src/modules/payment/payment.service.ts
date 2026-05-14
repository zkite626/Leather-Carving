import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async pay(
    userId: string,
    orderId: string,
    method: PaymentMethod,
  ): Promise<{
    id: string;
    status: PaymentStatus;
    transactionNo: string;
    paidAt: Date;
  }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    // Validate payment method
    if (method !== PaymentMethod.WECHAT && method !== PaymentMethod.ALIPAY) {
      throw new BadRequestException(
        'Invalid payment method. Supported: WECHAT, ALIPAY',
      );
    }

    const transactionNo = this.generateTransactionNo();

    // TODO: Integrate with real WeChat Pay / Alipay SDK
    // For now, simulate payment processing
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId,
          method,
          amount: order.payAmount,
          status: PaymentStatus.SUCCESS,
          transactionNo,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

      return payment;
    });

    this.logger.log(
      `Payment successful: ${result.id}, order: ${orderId}, method: ${method}, txn: ${transactionNo}`,
    );

    return {
      id: result.id,
      status: result.status,
      transactionNo,
      paidAt: result.paidAt!,
    };
  }

  async getPaymentByOrder(orderId: string) {
    return this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateTransactionNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TXN${timestamp}${random}`;
  }
}
