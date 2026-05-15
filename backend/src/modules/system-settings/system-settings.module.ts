import { Module } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';
import { MailService } from './mail.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, MailService],
  exports: [SystemSettingsService, MailService],
})
export class SystemSettingsModule {}
