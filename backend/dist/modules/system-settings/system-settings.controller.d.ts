import { SystemSettingsService } from './system-settings.service';
import { MailService } from './mail.service';
import { SmtpConfigDto } from './dto/smtp.dto';
export declare class SystemSettingsController {
    private readonly settingsService;
    private readonly mailService;
    constructor(settingsService: SystemSettingsService, mailService: MailService);
    getSmtp(): Promise<Record<string, string>>;
    updateSmtp(dto: SmtpConfigDto): Promise<Record<string, string>>;
    verifySmtp(): Promise<{
        success: boolean;
        message: string;
    }>;
}
