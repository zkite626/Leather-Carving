import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
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
