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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const admin_service_1 = require("./admin.service");
const admin_user_service_1 = require("./admin-user.service");
const admin_content_service_1 = require("./admin-content.service");
const admin_order_service_1 = require("./admin-order.service");
const admin_finance_service_1 = require("./admin-finance.service");
const admin_audit_service_1 = require("./admin-audit.service");
const admin_course_service_1 = require("./admin-course.service");
const admin_product_service_1 = require("./admin-product.service");
const audit_log_interceptor_1 = require("./interceptors/audit-log.interceptor");
const dto_1 = require("./dto");
let AdminController = class AdminController {
    adminService;
    adminUserService;
    adminContentService;
    adminOrderService;
    adminFinanceService;
    adminAuditService;
    adminCourseService;
    adminProductService;
    constructor(adminService, adminUserService, adminContentService, adminOrderService, adminFinanceService, adminAuditService, adminCourseService, adminProductService) {
        this.adminService = adminService;
        this.adminUserService = adminUserService;
        this.adminContentService = adminContentService;
        this.adminOrderService = adminOrderService;
        this.adminFinanceService = adminFinanceService;
        this.adminAuditService = adminAuditService;
        this.adminCourseService = adminCourseService;
        this.adminProductService = adminProductService;
    }
    async getDashboard(query) {
        return this.adminService.getDashboard(query);
    }
    async getRecentActivities() {
        return this.adminService.getRecentActivities();
    }
    async getUsers(query) {
        return this.adminUserService.getUsers(query);
    }
    async createUser(dto) {
        return this.adminUserService.createUser(dto);
    }
    async getUserById(id) {
        return this.adminUserService.getUserById(id);
    }
    async updateUser(id, dto) {
        return this.adminUserService.updateUser(id, dto);
    }
    async updateUserRole(id, dto) {
        return this.adminUserService.updateUserRole(id, dto);
    }
    async updateUserStatus(id, dto) {
        return this.adminUserService.updateUserStatus(id, dto);
    }
    async deleteUser(id) {
        return this.adminUserService.deleteUser(id);
    }
    async getCourses(query) {
        return this.adminCourseService.getCourses(query);
    }
    async createCourse(dto, req) {
        return this.adminCourseService.createCourse(req.user.sub, dto);
    }
    async getCourseById(id) {
        return this.adminCourseService.getCourseById(id);
    }
    async updateCourseStatus(id, dto) {
        return this.adminCourseService.updateCourseStatus(id, dto.status);
    }
    async deleteCourse(id) {
        return this.adminCourseService.deleteCourse(id);
    }
    async getProducts(query) {
        return this.adminProductService.getProducts(query);
    }
    async getProductCategories() {
        return this.adminProductService.getCategories();
    }
    async createProduct(dto) {
        return this.adminProductService.createProduct(dto);
    }
    async getProductById(id) {
        return this.adminProductService.getProductById(id);
    }
    async updateProduct(id, dto) {
        return this.adminProductService.updateProduct(id, dto);
    }
    async updateProductStatus(id, dto) {
        return this.adminProductService.updateProductStatus(id, dto.status);
    }
    async deleteProduct(id) {
        return this.adminProductService.deleteProduct(id);
    }
    getContentReview(query) {
        return this.adminContentService.getReviewQueue(query);
    }
    approveContent(id, type, dto) {
        return this.adminContentService.approveContent(id, type, dto);
    }
    rejectContent(id, type, dto) {
        return this.adminContentService.rejectContent(id, type, dto);
    }
    batchApprove(dto) {
        return this.adminContentService.batchApprove(dto);
    }
    batchReject(dto) {
        return this.adminContentService.batchReject(dto);
    }
    getOrders(query) {
        return this.adminOrderService.getOrders(query);
    }
    updateOrderStatus(id, dto) {
        return this.adminOrderService.updateOrderStatus(id, dto);
    }
    getFinanceSummary() {
        return this.adminFinanceService.getFinanceSummary();
    }
    getTransactions(query) {
        return this.adminFinanceService.getTransactions(query);
    }
    getMerchantSettlements() {
        return this.adminFinanceService.getMerchantSettlements();
    }
    async exportTransactions(query, res) {
        const data = await this.adminFinanceService.getTransactions({
            ...query,
            pageSize: 10000,
        });
        const header = 'Transaction No,Order No,Amount,Method,Status,Paid At,User\n';
        const rows = data.items
            .map((p) => `"${p.transactionNo ?? ''}","${p.order.orderNo}",${String(p.amount)},${p.method},${p.status},"${p.paidAt?.toISOString() ?? ''}","${p.order.user.nickname}"`)
            .join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send('﻿' + header + rows);
    }
    getAuditLogs(query) {
        return this.adminAuditService.getAuditLogs(query);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin dashboard overview' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('dashboard/activities'),
    (0, swagger_1.ApiOperation)({ summary: 'Recent system activities' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRecentActivities", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new user (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user detail (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user info (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Ban or unban user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'List all courses (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CourseQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Post)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Create course (admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Get)('courses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course detail (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCourseById", null);
__decorate([
    (0, common_1.Patch)('courses/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update course status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCourseStatus", null);
__decorate([
    (0, common_1.Delete)('courses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete course (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'List all products (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List product categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductCategories", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Create product (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product detail (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProductStatus", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('content/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Content review queue' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ContentReviewQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getContentReview", null);
__decorate([
    (0, common_1.Post)('content/:type/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve content' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.ApproveContentDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveContent", null);
__decorate([
    (0, common_1.Post)('content/:type/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject content' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.RejectContentDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectContent", null);
__decorate([
    (0, common_1.Post)('content/batch/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch approve content' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BatchContentActionDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "batchApprove", null);
__decorate([
    (0, common_1.Post)('content/batch/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch reject content' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BatchContentActionDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "batchReject", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'List all orders (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.OrderQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('finance/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Finance summary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFinanceSummary", null);
__decorate([
    (0, common_1.Get)('finance/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Transaction list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FinanceQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('finance/settlements'),
    (0, swagger_1.ApiOperation)({ summary: 'Merchant settlements' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMerchantSettlements", null);
__decorate([
    (0, common_1.Get)('finance/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions as CSV' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FinanceQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportTransactions", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Audit log list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuditLogQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)(audit_log_interceptor_1.AuditLogInterceptor),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        admin_user_service_1.AdminUserService,
        admin_content_service_1.AdminContentService,
        admin_order_service_1.AdminOrderService,
        admin_finance_service_1.AdminFinanceService,
        admin_audit_service_1.AdminAuditService,
        admin_course_service_1.AdminCourseService,
        admin_product_service_1.AdminProductService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map