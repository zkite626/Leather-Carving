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
import { UserRole } from '@prisma/client';
import { PatternService } from './pattern.service';
import {
  CreatePatternDto,
  UpdatePatternDto,
  QueryPatternDto,
} from './dto/pattern.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Pattern Assets')
@Controller('patterns')
export class PatternController {
  constructor(private readonly patternService: PatternService) {}

  @Get()
  @ApiOperation({ summary: 'List pattern assets' })
  async findAll(@Query() query: QueryPatternDto) {
    return this.patternService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pattern detail' })
  async findOne(@Param('id') id: string) {
    return this.patternService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create pattern asset (admin)' })
  async create(@Body() dto: CreatePatternDto) {
    return this.patternService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pattern asset (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePatternDto) {
    return this.patternService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pattern asset (admin)' })
  async remove(@Param('id') id: string) {
    return this.patternService.remove(id);
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Increment download count' })
  async incrementDownload(@Param('id') id: string) {
    return this.patternService.incrementDownload(id);
  }
}
