import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
export declare class AddressService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateAddressDto): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        province: string;
        city: string;
        district: string;
        detail: string;
        isDefault: boolean;
    }>;
    findAll(userId: string): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        province: string;
        city: string;
        district: string;
        detail: string;
        isDefault: boolean;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        province: string;
        city: string;
        district: string;
        detail: string;
        isDefault: boolean;
    }>;
    update(userId: string, id: string, dto: UpdateAddressDto): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        province: string;
        city: string;
        district: string;
        detail: string;
        isDefault: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
