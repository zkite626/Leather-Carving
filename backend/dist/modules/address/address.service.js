"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AddressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_ADDRESSES = 10;
let AddressService = AddressService_1 = class AddressService {
    prisma;
    logger = new common_1.Logger(AddressService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const addressCount = await this.prisma.address.count({
            where: { userId },
        });
        if (addressCount >= MAX_ADDRESSES) {
            throw new common_1.BadRequestException(`Maximum ${MAX_ADDRESSES} addresses allowed per user`);
        }
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await this.prisma.address.create({
            data: {
                userId,
                name: dto.name,
                phone: dto.phone,
                province: dto.province,
                city: dto.city,
                district: dto.district,
                detail: dto.detail,
                isDefault: dto.isDefault ?? false,
            },
        });
        this.logger.log(`Address created: ${address.id} for user ${userId}`);
        return address;
    }
    async findAll(userId) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(userId, id) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address || address.userId !== userId) {
            throw new common_1.NotFoundException('Address not found');
        }
        return address;
    }
    async update(userId, id, dto) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address || address.userId !== userId) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const updated = await this.prisma.address.update({
            where: { id },
            data: {
                name: dto.name,
                phone: dto.phone,
                province: dto.province,
                city: dto.city,
                district: dto.district,
                detail: dto.detail,
                isDefault: dto.isDefault,
            },
        });
        this.logger.log(`Address updated: ${id} for user ${userId}`);
        return updated;
    }
    async remove(userId, id) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address || address.userId !== userId) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.prisma.address.delete({ where: { id } });
        this.logger.log(`Address deleted: ${id} for user ${userId}`);
        return { message: 'Address deleted' };
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = AddressService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressService);
//# sourceMappingURL=address.service.js.map