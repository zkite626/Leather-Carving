import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type SafeUser = Omit<User, 'passwordHash'>;
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<SafeUser | null>;
    findByEmail(email: string): Promise<User | null>;
    updateProfile(userId: string, data: {
        nickname?: string;
        avatar?: string;
        bio?: string;
    }): Promise<SafeUser>;
}
export {};
