export declare class SmtpConfigDto {
    host: string;
    port: number;
    username?: string;
    password?: string;
    fromAddress: string;
    fromName?: string;
    encryption?: string;
    isActive?: boolean;
}
