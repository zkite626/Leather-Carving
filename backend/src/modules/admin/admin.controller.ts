import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { AdminUserService } from './admin-user.service';
import { AdminContentService } from './admin-content.service';
import { AdminOrderService } from './admin-order.service';
import { AdminFinanceService } from './admin-finance.service';
import { AdminAuditService } from './admin-audit.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import {
  DashboardQueryDto,
  UserQueryDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  ContentReviewQueryDto,
  ApproveContentDto,
  RejectContentDto,
  BatchContentActionDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
  FinanceQueryDto,
  AuditLogQueryDto,
} from './dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminUserService: AdminUserService,
    private readonly adminContentService: AdminContentService,
    private readonly adminOrderService: AdminOrderService,
    private readonly adminFinanceService: AdminFinanceService,
    private readonly adminAuditService: AdminAuditService,
  ) {}

  // ─── Dashboard ──────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard overview' })
  async getDashboard(@Query() query: DashboardQueryDto) {
    return this.adminService.getDashboard(query);
  }

  @Get('dashboard/activities')
  @ApiOperation({ summary: 'Recent system activities' })
  async getRecentActivities() {
    return this.adminService.getRecentActivities();
  }

  // ─── User Management ────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin)' })
  async getUsers(@Query() query: UserQueryDto) {
    return this.adminUserService.getUsers(query);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminUserService.updateUserRole(id, dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Ban or unban user' })
  async updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminUserService.updateUserStatus(id, dto);
  }

  // ─── Content Review ─────────────────────────────────────────────

  @Get('content/review')
  @ApiOperation({ summary: 'Content review queue' })
  getContentReview(@Query() query: ContentReviewQueryDto) {
    return this.adminContentService.getReviewQueue(query);
  }

  @Post('content/:type/:id/approve')
  @ApiOperation({ summary: 'Approve content' })
  approveContent(
    @Param('id') id: string,
    @Param('type') type: string,
    @Body() dto: ApproveContentDto,
  ) {
    return this.adminContentService.approveContent(id, type, dto);
  }

  @Post('content/:type/:id/reject')
  @ApiOperation({ summary: 'Reject content' })
  rejectContent(
    @Param('id') id: string,
    @Param('type') type: string,
    @Body() dto: RejectContentDto,
  ) {
    return this.adminContentService.rejectContent(id, type, dto);
  }

  @Post('content/batch/approve')
  @ApiOperation({ summary: 'Batch approve content' })
  batchApprove(@Body() dto: BatchContentActionDto) {
    return this.adminContentService.batchApprove(dto);
  }

  @Post('content/batch/reject')
  @ApiOperation({ summary: 'Batch reject content' })
  batchReject(@Body() dto: BatchContentActionDto) {
    return this.adminContentService.batchReject(dto);
  }

  // ─── Order Management ───────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List all orders (admin)' })
  getOrders(@Query() query: OrderQueryDto) {
    return this.adminOrderService.getOrders(query);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminOrderService.updateOrderStatus(id, dto);
  }

  // ─── Finance ────────────────────────────────────────────────────

  @Get('finance/summary')
  @ApiOperation({ summary: 'Finance summary' })
  getFinanceSummary() {
    return this.adminFinanceService.getFinanceSummary();
  }

  @Get('finance/transactions')
  @ApiOperation({ summary: 'Transaction list' })
  getTransactions(@Query() query: FinanceQueryDto) {
    return this.adminFinanceService.getTransactions(query);
  }

  @Get('finance/settlements')
  @ApiOperation({ summary: 'Merchant settlements' })
  getMerchantSettlements() {
    return this.adminFinanceService.getMerchantSettlements();
  }

  @Get('finance/export')
  @ApiOperation({ summary: 'Export transactions as CSV' })
  async exportTransactions(@Query() query: FinanceQueryDto, @Res() res: import('express').Response) {
    const data = await this.adminFinanceService.getTransactions({ ...query, pageSize: 10000 });
    const header = 'Transaction No,Order No,Amount,Method,Status,Paid At,User\n';
    const rows = data.items
      .map(
        (p) =>
          `"${p.transactionNo ?? ''}","${p.order.orderNo}",${p.amount},${p.method},${p.status},"${p.paidAt?.toISOString() ?? ''}","${p.order.user.nickname}"`,
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send('﻿' + header + rows);
  }

  // ─── Audit Logs ─────────────────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'Audit log list' })
  getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminAuditService.getAuditLogs(query);
  }
}
