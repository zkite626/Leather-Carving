import { SystemSettingsService } from './system-settings.service';
export declare class MailService {
    private readonly settingsService;
    private readonly logger;
    private transporter;
    private configLoaded;
    constructor(settingsService: SystemSettingsService);
    private getTransporter;
    resetTransporter(): void;
    sendMail(options: {
        to: string;
        subject: string;
        html: string;
        text?: string;
    }): Promise<boolean>;
    verifyConnection(): Promise<{
        success: boolean;
        message: string;
    }>;
}
