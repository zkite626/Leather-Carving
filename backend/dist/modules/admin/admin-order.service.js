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
var AdminOrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminOrderService = AdminOrderService_1 = class AdminOrderService {
    prisma;
    logger = new common_1.Logger(AdminOrderService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrders(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {
            ...(query.status && { status: query.status }),
            ...(query.keyword && {
                OR: [
                    { orderNo: { contains: query.keyword, mode: 'insensitive' } },
                    {
                        user: {
                            nickname: { contains: query.keyword, mode: 'insensitive' },
                        },
                    },
                ],
            }),
        };
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, nickname: true, avatar: true, email: true },
                    },
                    items: true,
                    payments: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            items: orders,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async updateOrderStatus(orderId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const validTransitions = {
            [client_1.OrderStatus.PAID]: [client_1.OrderStatus.SHIPPING, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.SHIPPING]: [client_1.OrderStatus.COMPLETED],
            [client_1.OrderStatus.COMPLETED]: [client_1.OrderStatus.REFUNDING],
            [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.CANCELLED],
        };
        const allowed = validTransitions[order.status] ?? [];
        const targetStatus = dto.status;
        if (!allowed.includes(targetStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
        }
        const updateData = {
            status: targetStatus,
        };
        if (targetStatus === client_1.OrderStatus.SHIPPING) {
            updateData.shippedAt = new Date();
        }
        else if (targetStatus === client_1.OrderStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }
        else if (targetStatus === client_1.OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                user: { select: { id: true, nickname: true, email: true } },
                items: true,
            },
        });
        this.logger.log(`Order ${order.orderNo} status: ${order.status} -> ${dto.status}`);
        return updated;
    }
};
exports.AdminOrderService = AdminOrderService;
exports.AdminOrderService = AdminOrderService = AdminOrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminOrderService);
//# sourceMappingURL=admin-order.service.js.map