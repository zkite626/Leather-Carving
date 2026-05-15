"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const admin_user_service_1 = require("./admin-user.service");
const admin_content_service_1 = require("./admin-content.service");
const admin_order_service_1 = require("./admin-order.service");
const admin_finance_service_1 = require("./admin-finance.service");
const admin_audit_service_1 = require("./admin-audit.service");
const admin_course_service_1 = require("./admin-course.service");
const admin_product_service_1 = require("./admin-product.service");
const prisma_module_1 = require("../prisma/prisma.module");
const redis_module_1 = require("../redis/redis.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, schedule_1.ScheduleModule.forRoot()],
        controllers: [admin_controller_1.AdminController],
        providers: [
            admin_service_1.AdminService,
            admin_user_service_1.AdminUserService,
            admin_content_service_1.AdminContentService,
            admin_order_service_1.AdminOrderService,
            admin_finance_service_1.AdminFinanceService,
            admin_audit_service_1.AdminAuditService,
            admin_course_service_1.AdminCourseService,
            admin_product_service_1.AdminProductService,
        ],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map