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
import { ArtworkService } from './artwork.service';
import {
  CreateArtworkDto,
  UpdateArtworkDto,
  QueryArtworkDto,
} from './dto/create-artwork.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Artworks')
@Controller('artworks')
export class ArtworkController {
  constructor(private readonly artworkService: ArtworkService) {}

  @Get()
  @ApiOperation({ summary: 'List published artworks (gallery)' })
  async findAll(@Query() query: QueryArtworkDto) {
    return this.artworkService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my artworks' })
  async findMy(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryArtworkDto,
  ) {
    return this.artworkService.findByUser(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artwork detail' })
  async findOne(@Param('id') id: string) {
    return this.artworkService.findOne(id, true);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related artworks' })
  async getRelated(@Param('id') id: string) {
    return this.artworkService.getRelated(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create artwork' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateArtworkDto,
  ) {
    return this.artworkService.create(userId, dto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add images to artwork' })
  async addImages(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { imageUrls: string[] },
  ) {
    return this.artworkService.addImages(id, userId, body.imageUrls);
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder artwork images' })
  async reorderImages(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { imageIds: string[] },
  ) {
    return this.artworkService.reorderImages(id, userId, body.imageIds);
  }

  @Post(':id/images/:imageId/cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set image as cover' })
  async setCover(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.artworkService.setCoverImage(id, userId, imageId);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artwork image' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.artworkService.deleteImage(id, userId, imageId);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit artwork for review' })
  async submitForReview(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.artworkService.submitForReview(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artwork' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateArtworkDto,
  ) {
    return this.artworkService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artwork (soft)' })
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.artworkService.remove(id, userId);
  }
}
