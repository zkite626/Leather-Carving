import { PrismaService } from '../prisma/prisma.service';
import { SmtpConfigDto } from './dto/smtp.dto';
export declare class SystemSettingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getByCategory(category: string): Promise<Record<string, string>>;
    upsert(category: string, key: string, value: string, label?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        value: string;
        key: string;
        label: string | null;
    }>;
    upsertBatch(category: string, entries: Array<{
        key: string;
        value: string;
        label?: string;
    }>): Promise<Record<string, string>>;
    private readonly SMTP_KEYS;
    getSmtpConfig(): Promise<Record<string, string>>;
    updateSmtpConfig(dto: SmtpConfigDto): Promise<Record<string, string>>;
    getRawSmtpConfig(): Promise<Record<string, string>>;
}
