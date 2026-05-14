import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course review' })
  async createCourseReview(
    @Param('courseId') courseId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createCourseReview(userId, courseId, dto);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get course reviews' })
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.reviewService.getCourseReviews(courseId, page, pageSize);
  }

  @Get('courses/:courseId/summary')
  @ApiOperation({ summary: 'Get course review summary' })
  async getCourseReviewSummary(@Param('courseId') courseId: string) {
    return this.reviewService.getCourseReviewSummary(courseId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.reviewService.deleteReview(id, userId);
    return { message: 'Review deleted' };
  }
}
