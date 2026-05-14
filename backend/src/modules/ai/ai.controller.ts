import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChatDto } from './dto/chat.dto';
import { PatternGenerateDto } from './dto/pattern-generate.dto';
import { RecommendDto } from './dto/recommend.dto';

@ApiTags('AI')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI chat with SSE streaming' })
  @HttpCode(HttpStatus.OK)
  async chat(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChatDto,
    @Res() res: any,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const generator = this.aiService.chat({
        message: dto.message,
        sessionId: dto.sessionId,
        context: dto.context,
        userId,
      });

      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      res.write(`data: ${JSON.stringify({ error: errMsg, done: true })}\n\n`);
    }

    res.end();
  }

  @Post('pattern/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AI pattern image' })
  async generatePattern(
    @CurrentUser('sub') userId: string,
    @Body() dto: PatternGenerateDto,
  ) {
    const imageUrl = await this.aiService.generatePattern({
      prompt: dto.prompt,
      style: dto.style,
      size: dto.size,
    });

    return { imageUrl, prompt: dto.prompt, style: dto.style };
  }

  @Post('recommend/courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI course recommendations' })
  async recommendCourses(
    @CurrentUser('sub') userId: string,
    @Body() dto: RecommendDto,
  ) {
    const result = await this.aiService.recommendCourses({
      userId,
      preferences: dto.preferences,
      limit: dto.limit,
    });

    return { recommendations: result };
  }

  @Post('recommend/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI product recommendations' })
  async recommendProducts(
    @CurrentUser('sub') userId: string,
    @Body() dto: RecommendDto,
  ) {
    const result = await this.aiService.recommendProducts({
      userId,
      preferences: dto.preferences,
      limit: dto.limit,
    });

    return { recommendations: result };
  }
}
