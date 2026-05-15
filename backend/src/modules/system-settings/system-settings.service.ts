import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmtpConfigDto } from './dto/smtp.dto';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getByCategory(category: string) {
    const settings = await this.prisma.systemSetting.findMany({
      where: { category },
    });
    return settings.reduce<Record<string, string>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }

  async upsert(category: string, key: string, value: string, label?: string) {
    return this.prisma.systemSetting.upsert({
      where: { category_key: { category, key } },
      update: { value, ...(label !== undefined ? { label } : {}) },
      create: { category, key, value, label },
    });
  }

  async upsertBatch(category: string, entries: Array<{ key: string; value: string; label?: string }>) {
    for (const entry of entries) {
      await this.upsert(category, entry.key, entry.value, entry.label);
    }
    return this.getByCategory(category);
  }

  /* ─── SMTP helpers ─────────────────────────────────────── */

  private readonly SMTP_KEYS: Record<string, string> = {
    host: 'SMTP 服务器',
    port: '端口',
    username: '用户名',
    password: '密码',
    fromAddress: '发件人邮箱',
    fromName: '发件人名称',
    encryption: '加密方式',
    isActive: '启用状态',
  };

  async getSmtpConfig(): Promise<Record<string, string>> {
    const raw = await this.getByCategory('smtp');
    // Mask password
    if (raw.password) {
      raw.password = '********';
    }
    return raw;
  }

  async updateSmtpConfig(dto: SmtpConfigDto) {
    const entries = Object.entries(dto)
      .filter(([, v]) => v !== undefined)
      .map(([key, value]) => ({
        key,
        value: String(value),
        label: this.SMTP_KEYS[key],
      }));
    await this.upsertBatch('smtp', entries);
    return this.getSmtpConfig();
  }

  async getRawSmtpConfig() {
    return this.getByCategory('smtp');
  }
}
