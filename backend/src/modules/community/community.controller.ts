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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreatePostDto, PostType } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  @ApiOperation({ summary: 'List posts with filtering' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'type', required: false, enum: PostType })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('type') type?: PostType,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.communityService.findAll({ page, pageSize, type, keyword, sortBy, sortOrder });
  }

  @Get('posts/hot')
  @ApiOperation({ summary: 'Get hot topics' })
  async getHotTopics() {
    return this.communityService.getHotTopics();
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post detail' })
  async findOne(@Param('id') id: string) {
    return this.communityService.findOne(id);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.communityService.create(userId, dto);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.communityService.update(id, userId, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.communityService.remove(id, userId);
    return { message: 'Post deleted' };
  }

  @Get('posts/:id/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get challenge check-in status' })
  async getCheckinStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.communityService.getChallengeCheckins(userId, id);
  }

  @Post('posts/:id/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in to a challenge' })
  async checkin(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.communityService.checkin(userId, id);
  }
}
