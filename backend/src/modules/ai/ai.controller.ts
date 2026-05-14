import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AIConfigService } from './ai-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { ChatDto } from './dto/chat.dto';
import { PatternGenerateDto } from './dto/pattern-generate.dto';
import { RecommendDto } from './dto/recommend.dto';

@ApiTags('AI')
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly aiConfigService: AIConfigService,
  ) {}

  // ─── AI Config CRUD (Admin) ─────────────────────────────────

  @Get('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all AI model configs' })
  async getConfigs() {
    return this.aiConfigService.getAllConfigs();
  }

  @Post('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create AI model config' })
  async createConfig(@Body() dto: Record<string, unknown>) {
    const result = await this.aiConfigService.createConfig(dto);
    return result;
  }

  @Patch('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update AI model config' })
  async updateConfig(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    const result = await this.aiConfigService.updateConfig(id, dto);
    return result;
  }

  @Delete('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete AI model config' })
  async deleteConfig(@Param('id') id: string) {
    await this.aiConfigService.deleteConfig(id);
    return { message: 'AI config deleted' };
  }

  @Post('configs/:id/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test AI model connectivity' })
  async testConfig(@Param('id') id: string) {
    return this.aiConfigService.testConnectivity(id);
  }

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
