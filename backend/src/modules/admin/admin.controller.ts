import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { AdminUserService } from './admin-user.service';
import { AdminContentService } from './admin-content.service';
import { AdminOrderService } from './admin-order.service';
import { AdminFinanceService } from './admin-finance.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminCourseService } from './admin-course.service';
import { AdminProductService } from './admin-product.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import {
  DashboardQueryDto,
  UserQueryDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  CreateUserDto,
  UpdateUserDto,
  ContentReviewQueryDto,
  ApproveContentDto,
  RejectContentDto,
  BatchContentActionDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
  FinanceQueryDto,
  AuditLogQueryDto,
  CourseQueryDto,
  ProductQueryDto,
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
    private readonly adminCourseService: AdminCourseService,
    private readonly adminProductService: AdminProductService,
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

  @Post('users')
  @ApiOperation({ summary: 'Create new user (admin)' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminUserService.createUser(dto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail (admin)' })
  async getUserById(@Param('id') id: string) {
    return this.adminUserService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user info (admin)' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminUserService.updateUser(id, dto);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminUserService.updateUserRole(id, dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Ban or unban user' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUserService.updateUserStatus(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin)' })
  async deleteUser(@Param('id') id: string) {
    return this.adminUserService.deleteUser(id);
  }

  // ─── Course Management ──────────────────────────────────────────

  @Get('courses')
  @ApiOperation({ summary: 'List all courses (admin)' })
  async getCourses(@Query() query: CourseQueryDto) {
    return this.adminCourseService.getCourses(query);
  }

  @Post('courses')
  @ApiOperation({ summary: 'Create course (admin)' })
  async createCourse(
    @Body() dto: Record<string, unknown>,
    @Req() req: { user: { sub: string } },
  ) {
    return this.adminCourseService.createCourse(req.user.sub, dto as never);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course detail (admin)' })
  async getCourseById(@Param('id') id: string) {
    return this.adminCourseService.getCourseById(id);
  }

  @Patch('courses/:id/status')
  @ApiOperation({ summary: 'Update course status' })
  async updateCourseStatus(
    @Param('id') id: string,
    @Body() dto: { status: string },
  ) {
    return this.adminCourseService.updateCourseStatus(id, dto.status);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Delete course (admin)' })
  async deleteCourse(@Param('id') id: string) {
    return this.adminCourseService.deleteCourse(id);
  }

  // ─── Product Management ─────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List all products (admin)' })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.adminProductService.getProducts(query);
  }

  @Get('products/categories')
  @ApiOperation({ summary: 'List product categories' })
  async getProductCategories() {
    return this.adminProductService.getCategories();
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product (admin)' })
  async createProduct(@Body() dto: Record<string, unknown>) {
    return this.adminProductService.createProduct(dto as never);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product detail (admin)' })
  async getProductById(@Param('id') id: string) {
    return this.adminProductService.getProductById(id);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product (admin)' })
  async updateProduct(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.adminProductService.updateProduct(id, dto as never);
  }

  @Patch('products/:id/status')
  @ApiOperation({ summary: 'Update product status' })
  async updateProductStatus(
    @Param('id') id: string,
    @Body() dto: { status: string },
  ) {
    return this.adminProductService.updateProductStatus(id, dto.status);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product (admin)' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminProductService.deleteProduct(id);
  }

  // ─── Artwork Management ────────────────────────────────────────

  @Get('artworks')
  @ApiOperation({ summary: 'List all artworks (admin)' })
  async getArtworks(@Query() query: Record<string, string | number>) {
    return this.adminContentService.getArtworks(query);
  }

  @Post('artworks')
  @ApiOperation({ summary: 'Create artwork (admin)' })
  async createArtwork(
    @Body() dto: Record<string, unknown>,
    @Req() req: { user: { sub: string } },
  ) {
    return this.adminContentService.createArtwork(req.user.sub, dto);
  }

  @Patch('artworks/:id')
  @ApiOperation({ summary: 'Update artwork (admin)' })
  async updateArtwork(
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.adminContentService.updateArtwork(id, dto);
  }

  @Patch('artworks/:id/status')
  @ApiOperation({ summary: 'Update artwork status (admin)' })
  async updateArtworkStatus(
    @Param('id') id: string,
    @Body() dto: { status: string },
  ) {
    return this.adminContentService.updateArtworkStatus(id, dto.status);
  }

  @Delete('artworks/:id')
  @ApiOperation({ summary: 'Delete artwork (admin)' })
  async deleteArtwork(@Param('id') id: string) {
    return this.adminContentService.deleteArtwork(id);
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
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
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
  async exportTransactions(
    @Query() query: FinanceQueryDto,
    @Res() res: import('express').Response,
  ) {
    const data = await this.adminFinanceService.getTransactions({
      ...query,
      pageSize: 10000,
    });
    const header =
      'Transaction No,Order No,Amount,Method,Status,Paid At,User\n';
    const rows = data.items
      .map(
        (p) =>
          `"${p.transactionNo ?? ''}","${p.order.orderNo}",${String(p.amount)},${p.method},${p.status},"${p.paidAt?.toISOString() ?? ''}","${p.order.user.nickname}"`,
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv',
    );
    res.send('﻿' + header + rows);
  }

  // ─── Audit Logs ─────────────────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'Audit log list' })
  getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminAuditService.getAuditLogs(query);
  }
}
