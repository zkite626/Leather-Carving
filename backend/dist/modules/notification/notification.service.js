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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, params) {
        const { page = 1, pageSize = 20, isRead } = params;
        const skip = (page - 1) * pageSize;
        const where = { userId };
        if (isRead !== undefined)
            where.isRead = isRead;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return {
            data: notifications,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async create(data) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                content: data.content,
                link: data.link || null,
            },
        });
        this.logger.log(`Notification created for user ${data.userId}: ${data.title}`);
        return notification;
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        if (notification.userId !== userId) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        this.logger.log(`All notifications marked as read for user ${userId}`);
        return { message: 'All notifications marked as read' };
    }
    async remove(id, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        if (notification.userId !== userId) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.prisma.notification.delete({ where: { id } });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map