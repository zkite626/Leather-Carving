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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('artworks/:artworkId')
  @ApiOperation({ summary: 'Get artwork comments' })
  async getArtworkComments(
    @Param('artworkId') artworkId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.commentService.findByEntity(
      'artwork',
      artworkId,
      page,
      pageSize,
    );
  }

  @Post('artworks/:artworkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on artwork' })
  async commentOnArtwork(
    @Param('artworkId') artworkId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(userId, 'artwork', artworkId, dto);
  }

  @Get('posts/:postId')
  @ApiOperation({ summary: 'Get post comments' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.commentService.findByEntity('post', postId, page, pageSize);
  }

  @Post('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on post' })
  async commentOnPost(
    @Param('postId') postId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(userId, 'post', postId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.commentService.remove(id, userId);
    return { message: 'Comment deleted' };
  }
}
