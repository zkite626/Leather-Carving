import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SystemSettingsService } from './system-settings.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private configLoaded = false;

  constructor(private readonly settingsService: SystemSettingsService) {}

  private async getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.configLoaded && this.transporter) return this.transporter;

    try {
      const config = await this.settingsService.getRawSmtpConfig();

      if (!config.host || config.isActive !== 'true') {
        this.logger.warn('SMTP not configured or disabled');
        return null;
      }

      const port = Number(config.port) || 465;
      const encryption = config.encryption || 'ssl';

      this.transporter = nodemailer.createTransport({
        host: config.host,
        port,
        secure: encryption === 'ssl',
        auth: config.username
          ? { user: config.username, pass: config.password }
          : undefined,
        tls: encryption === 'tls' ? { rejectUnauthorized: false } : undefined,
      });

      this.configLoaded = true;
      return this.transporter;
    } catch (err) {
      this.logger.error('Failed to create SMTP transporter', err);
      return null;
    }
  }

  /** Reset cached transporter (call after SMTP config update) */
  resetTransporter() {
    this.transporter = null;
    this.configLoaded = false;
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      this.logger.warn('Cannot send email: SMTP not available');
      return false;
    }

    try {
      const config = await this.settingsService.getRawSmtpConfig();
      const from = config.fromName
        ? `"${config.fromName}" <${config.fromAddress}>`
        : config.fromAddress;

      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
      return false;
    }
  }

  async verifyConnection(): Promise<{ success: boolean; message: string }> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      return { success: false, message: 'SMTP 未配置或未启用' };
    }
    try {
      await transporter.verify();
      return { success: true, message: 'SMTP 连接成功' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '连接失败';
      return { success: false, message: `SMTP 连接失败: ${msg}` };
    }
  }
}
