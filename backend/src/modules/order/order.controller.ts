import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { OrderService } from './order.service';
import { PaymentService } from '../payment/payment.service';
import { CreateOrderDto, QueryOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('shop/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my orders' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryOrderDto,
  ) {
    return this.orderService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  async findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.orderService.findOne(userId, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay for order' })
  async pay(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('method') method?: PaymentMethod,
  ) {
    return this.paymentService.pay(userId, id, method ?? PaymentMethod.WECHAT);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancel(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.orderService.cancel(userId, id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm receipt' })
  async confirmReceipt(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.orderService.confirmReceipt(userId, id);
  }
}
