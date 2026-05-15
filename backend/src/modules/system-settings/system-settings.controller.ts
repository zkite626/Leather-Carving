import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { MailService } from './mail.service';
import { SmtpConfigDto } from './dto/smtp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('System Settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(
    private readonly settingsService: SystemSettingsService,
    private readonly mailService: MailService,
  ) {}

  @Get('smtp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SMTP config' })
  async getSmtp() {
    return this.settingsService.getSmtpConfig();
  }

  @Put('smtp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update SMTP config' })
  async updateSmtp(@Body() dto: SmtpConfigDto) {
    const result = await this.settingsService.updateSmtpConfig(dto);
    this.mailService.resetTransporter();
    return result;
  }

  @Post('smtp/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test SMTP connection' })
  async verifySmtp() {
    return this.mailService.verifyConnection();
  }
}
