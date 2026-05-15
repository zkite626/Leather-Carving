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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const order_service_1 = require("./order.service");
const payment_service_1 = require("../payment/payment.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let OrderController = class OrderController {
    orderService;
    paymentService;
    constructor(orderService, paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }
    async create(userId, dto) {
        return this.orderService.create(userId, dto);
    }
    async findAll(userId, query) {
        return this.orderService.findAll(userId, query);
    }
    async findOne(userId, id) {
        return this.orderService.findOne(userId, id);
    }
    async pay(userId, id, method) {
        return this.paymentService.pay(userId, id, method ?? client_1.PaymentMethod.WECHAT);
    }
    async cancel(userId, id) {
        return this.orderService.cancel(userId, id);
    }
    async confirmReceipt(userId, id) {
        return this.orderService.confirmReceipt(userId, id);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my orders' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_dto_1.QueryOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order detail' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Pay for order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm receipt' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "confirmReceipt", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('shop/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        payment_service_1.PaymentService])
], OrderController);
//# sourceMappingURL=order.controller.js.map