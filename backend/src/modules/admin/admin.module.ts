import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUserService } from './admin-user.service';
import { AdminContentService } from './admin-content.service';
import { AdminOrderService } from './admin-order.service';
import { AdminFinanceService } from './admin-finance.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminCourseService } from './admin-course.service';
import { AdminProductService } from './admin-product.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule, ScheduleModule.forRoot()],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminUserService,
    AdminContentService,
    AdminOrderService,
    AdminFinanceService,
    AdminAuditService,
    AdminCourseService,
    AdminProductService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
