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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let OrderService = OrderService_1 = class OrderService {
    prisma;
    logger = new common_1.Logger(OrderService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const productIds = dto.items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        for (const item of dto.items) {
            const product = productMap.get(item.productId);
            if (!product) {
                throw new common_1.BadRequestException(`Product ${item.productId} not found`);
            }
            if (product.status !== client_1.ProductStatus.ON_SALE) {
                throw new common_1.BadRequestException(`Product "${product.name}" is not available for purchase`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Product "${product.name}" has insufficient stock (available: ${product.stock})`);
            }
        }
        let totalAmount = new client_1.Prisma.Decimal(0);
        for (const item of dto.items) {
            const product = productMap.get(item.productId);
            totalAmount = totalAmount.add(new client_1.Prisma.Decimal(product.price).mul(item.quantity));
        }
        const orderNo = await this.generateOrderNo();
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const product = productMap.get(item.productId);
                const result = await tx.$executeRaw `
          UPDATE products
          SET stock = stock - ${item.quantity},
              sales = sales + ${item.quantity},
              version = version + 1
          WHERE id = ${item.productId}
            AND version = ${product.version}
            AND stock >= ${item.quantity}
        `;
                if (result === 0) {
                    throw new common_1.BadRequestException(`Product "${product.name}" stock changed or insufficient. Please retry.`);
                }
            }
            return tx.order.create({
                data: {
                    orderNo,
                    userId,
                    totalAmount,
                    payAmount: totalAmount,
                    status: client_1.OrderStatus.PENDING,
                    address: dto.address,
                    remark: dto.remark,
                    items: {
                        create: dto.items.map((item) => {
                            const product = productMap.get(item.productId);
                            return {
                                productId: item.productId,
                                productName: product.name,
                                productImage: product.coverImage,
                                price: product.price,
                                quantity: item.quantity,
                            };
                        }),
                    },
                },
                include: {
                    items: true,
                },
            });
        });
        this.logger.log(`Order created: ${order.id}, orderNo: ${orderNo}`);
        return order;
    }
    async findAll(userId, query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {
            userId,
            ...(query.status ? { status: query.status } : {}),
        };
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    coverImage: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: orders,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async findOne(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                coverImage: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!order || order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async cancel(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order || order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== client_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending orders can be cancelled');
        }
        const cancelledOrder = await this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                        sales: { decrement: item.quantity },
                    },
                });
            }
            return tx.order.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.CANCELLED,
                    cancelledAt: new Date(),
                },
                include: { items: true },
            });
        });
        this.logger.log(`Order cancelled: ${orderId}`);
        return cancelledOrder;
    }
    async confirmReceipt(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order || order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== client_1.OrderStatus.SHIPPING) {
            throw new common_1.BadRequestException('Only shipping orders can be confirmed as received');
        }
        const completedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.COMPLETED,
                completedAt: new Date(),
            },
            include: { items: true },
        });
        this.logger.log(`Order receipt confirmed: ${orderId}`);
        return completedOrder;
    }
    async updateStatus(orderId, status, data) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                ...data,
            },
        });
    }
    async generateOrderNo() {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0');
        let orderNo;
        let exists;
        do {
            const random = Math.floor(1000 + Math.random() * 9000).toString();
            orderNo = `LC${dateStr}${random}`;
            const existing = await this.prisma.order.findUnique({
                where: { orderNo },
                select: { id: true },
            });
            exists = !!existing;
        } while (exists);
        return orderNo;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map