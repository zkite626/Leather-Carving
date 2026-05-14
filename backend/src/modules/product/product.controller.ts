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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  AddProductImagesDto,
} from './dto/create-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Products')
@Controller('shop/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters' })
  async findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get('guangxi')
  @ApiOperation({ summary: 'Get Guangxi specialty products' })
  async getGuangxiProducts() {
    return this.productService.getGuangxiProducts();
  }

  @Get('hot')
  @ApiOperation({ summary: 'Get hot products' })
  async getHotProducts() {
    return this.productService.getHotProducts();
  }

  @Get('new')
  @ApiOperation({ summary: 'Get new products' })
  async getNewProducts() {
    return this.productService.getNewProducts();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant own products' })
  async findMy(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productService.findByMerchant(userId, query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  async findOne(@Param('slug') slug: string) {
    return this.productService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (soft)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productService.remove(id, userId);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add images to product' })
  async addImages(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: AddProductImagesDto,
  ) {
    return this.productService.addImages(id, userId, dto.imageUrls);
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder product images' })
  async reorderImages(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { imageIds: string[] },
  ) {
    return this.productService.reorderImages(id, userId, body.imageIds);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product image' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productService.deleteImage(id, userId, imageId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('status') status: ProductStatus,
  ) {
    return this.productService.updateStatus(id, userId, status);
  }
}
