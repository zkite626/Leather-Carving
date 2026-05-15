"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const child_process_1 = require("child_process");
const bcrypt = __importStar(require("bcryptjs"));
const path = __importStar(require("path"));
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    initialized = false;
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        const adapter = new adapter_pg_1.PrismaPg(connectionString);
        super({ adapter });
    }
    async onModuleInit() {
        this.logger.log('━━━ Database Initialization ━━━');
        await this.ensureDatabase();
        await this.connectWithRetry();
        await this.ensureSchema();
        await this.ensureSeedData();
        this.initialized = true;
        this.logger.log('━━━ Database Ready ━━━');
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    async connectWithRetry() {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.$connect();
                this.logger.log(`Database connected (attempt ${attempt}/${maxAttempts})`);
                return;
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                if (attempt === maxAttempts) {
                    this.logger.error(`Database connection failed after ${maxAttempts} attempts: ${msg}`);
                    throw err;
                }
                this.logger.warn(`Connection attempt ${attempt}/${maxAttempts} failed: ${msg}, retrying in 1s...`);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }
    parseConnectionString(url) {
        const parsed = new URL(url);
        return {
            host: parsed.hostname,
            port: parseInt(parsed.port || '5432', 10),
            user: parsed.username,
            password: parsed.password,
            database: parsed.pathname.slice(1).split('?')[0],
        };
    }
    async ensureDatabase() {
        const connStr = process.env.DATABASE_URL;
        if (!connStr)
            throw new Error('DATABASE_URL environment variable is required');
        const info = this.parseConnectionString(connStr);
        const admin = new pg_1.Client({
            host: info.host,
            port: info.port,
            user: info.user,
            password: info.password,
            database: 'postgres',
            connectionTimeoutMillis: 5000,
        });
        try {
            await admin.connect();
            this.logger.log(`Checking database "${info.database}" on ${info.host}:${info.port}...`);
            const result = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [info.database]);
            if (result.rows.length === 0) {
                this.logger.warn(`Database "${info.database}" not found — creating...`);
                await admin.query(`CREATE DATABASE "${info.database}"`);
                this.logger.log(`Database "${info.database}" created successfully`);
            }
            else {
                this.logger.log(`Database "${info.database}" exists`);
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Database check failed: ${msg}`);
            throw err;
        }
        finally {
            await admin.end();
        }
    }
    async ensureSchema() {
        try {
            const result = await this.$queryRawUnsafe(`SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        ) as exists`);
            if (result[0]?.exists) {
                this.logger.log('Schema check: tables exist');
                return;
            }
            this.logger.warn('Schema check: tables not found — running prisma db push...');
            const configPath = path.resolve(process.cwd(), 'prisma', 'prisma.config.ts');
            const output = (0, child_process_1.execSync)(`npx prisma db push --config "${configPath}" --accept-data-loss`, {
                cwd: process.cwd(),
                stdio: 'pipe',
                timeout: 120000,
                env: { ...process.env },
            });
            this.logger.log('Schema push completed');
            if (output) {
                const lines = output.toString().trim().split('\n');
                for (const line of lines) {
                    if (line.trim())
                        this.logger.log(`  ${line.trim()}`);
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Schema push failed: ${msg}`);
            this.logger.error('Please run manually: cd backend && npx prisma db push --config prisma/prisma.config.ts');
            throw err;
        }
    }
    async ensureSeedData() {
        try {
            const userCount = await this.user.count();
            if (userCount > 0) {
                this.logger.log(`Seed check: ${userCount} users found — skipping`);
                return;
            }
            this.logger.warn('Seed check: no data found — seeding initial data...');
            const seedUsers = [
                { email: 'admin@leather-carving.com', password: 'Admin123!', nickname: '超级管理员', role: 'SUPER_ADMIN', phone: '13800000001' },
                { email: 'teacher@leather-carving.com', password: 'Teacher123!', nickname: '示范教师', role: 'TEACHER', phone: '13800000002' },
                { email: 'merchant@leather-carving.com', password: 'Merchant123!', nickname: '示范商家', role: 'MERCHANT', phone: '13800000003' },
                { email: 'learner@leather-carving.com', password: 'Learner123!', nickname: '示范学员', role: 'LEARNER', phone: '13800000004' },
            ];
            const createdUsers = {};
            for (const u of seedUsers) {
                const passwordHash = await bcrypt.hash(u.password, 12);
                const user = await this.user.upsert({
                    where: { email: u.email },
                    update: {},
                    create: {
                        email: u.email,
                        passwordHash,
                        nickname: u.nickname,
                        role: u.role,
                        phone: u.phone,
                        emailVerified: true,
                        status: 'ACTIVE',
                    },
                });
                createdUsers[u.email] = user;
            }
            this.logger.log('  Seeded 4 users (admin/teacher/merchant/learner)');
            const teacherUser = createdUsers['teacher@leather-carving.com'];
            if (teacherUser) {
                await this.teacherProfile.upsert({
                    where: { userId: teacherUser.id },
                    update: {},
                    create: {
                        userId: teacherUser.id,
                        title: '资深皮雕工艺师',
                        specialties: ['皮雕', '植鞣革', '皮具制作'],
                        experience: 10,
                        introduction: '拥有十年皮雕教学经验，擅长将传统工艺与现代设计相结合。',
                        isVerified: true,
                        certifications: { items: ['国家高级工艺美术师', '广西非物质文化遗产传承人'] },
                    },
                });
                this.logger.log('  Seeded teacher profile');
            }
            const toolsCategory = await this.productCategory.upsert({
                where: { slug: 'leather-tools' },
                update: {},
                create: { name: '皮雕工具', slug: 'leather-tools', icon: 'tool', sortOrder: 1 },
            });
            const materialCategory = await this.productCategory.upsert({
                where: { slug: 'leather-materials' },
                update: {},
                create: { name: '皮料辅料', slug: 'leather-materials', icon: 'layers', sortOrder: 2 },
            });
            await this.productCategory.upsert({
                where: { slug: 'vegetable-tanned' },
                update: {},
                create: { name: '植鞣革', slug: 'vegetable-tanned', parentId: materialCategory.id, sortOrder: 1 },
            });
            this.logger.log('  Seeded 3 product categories');
            const merchantUser = createdUsers['merchant@leather-carving.com'];
            if (merchantUser) {
                const sampleProducts = [
                    {
                        name: '壮锦纹样雕刻工具套装', slug: 'zhuangjin-carving-tool-set',
                        description: '精选优质钢材打造，包含10把不同规格的皮雕工具，适合雕刻壮锦传统纹样。',
                        price: 298.00, originalPrice: 398.00, stock: 50, stockAlert: 10, sales: 128, rating: 4.80,
                        status: 'ON_SALE', isGuangxi: true, categoryId: toolsCategory.id,
                        tags: ['工具套装', '壮锦', '皮雕'], attributes: { 材质: '高碳钢+红木', 件数: '10件套' },
                    },
                    {
                        name: '意大利进口植鞣革 A4', slug: 'italian-vegetable-tanned-a4',
                        description: '意大利进口头层植鞣革，厚度1.2mm，A4尺寸。质地细腻，适合精细皮雕。',
                        price: 68.00, stock: 200, stockAlert: 20, sales: 356, rating: 4.60,
                        status: 'ON_SALE', isGuangxi: false, categoryId: materialCategory.id,
                        tags: ['植鞣革', '进口', 'A4'], attributes: { 产地: '意大利', 厚度: '1.2mm' },
                    },
                    {
                        name: '广西瑶族刺绣皮包', slug: 'yao-embroidery-leather-bag',
                        description: '融合瑶族传统刺绣工艺与现代皮具设计，手工缝制。采用优质牛皮。',
                        price: 588.00, originalPrice: 788.00, stock: 15, stockAlert: 5, sales: 42, rating: 4.90,
                        status: 'ON_SALE', isGuangxi: true, categoryId: materialCategory.id,
                        tags: ['瑶族', '刺绣', '皮包', '非遗'], attributes: { 材质: '头层牛皮', 工艺: '手工刺绣+皮雕' },
                    },
                    {
                        name: '喀斯特山水纹皮雕画框', slug: 'karst-landscape-leather-frame',
                        description: '以广西喀斯特地貌为灵感，手工雕刻山水纹样的皮雕装饰画框。',
                        price: 428.00, stock: 30, stockAlert: 5, sales: 86, rating: 4.70,
                        status: 'ON_SALE', isGuangxi: true, categoryId: toolsCategory.id,
                        tags: ['喀斯特', '装饰画', '皮雕'], attributes: { 材质: '植鞣革+实木框', 工艺: '手工皮雕' },
                    },
                    {
                        name: '皮雕入门教程套装', slug: 'beginner-carving-starter-kit',
                        description: '包含基础皮雕工具3件、练习皮革2片、教程手册1本。适合零基础入门。',
                        price: 128.00, stock: 100, stockAlert: 15, sales: 520, rating: 4.50,
                        status: 'ON_SALE', isGuangxi: false, categoryId: toolsCategory.id,
                        tags: ['入门', '教程', '套装'], attributes: { 包含: '工具3件+皮革2片+教程' },
                    },
                ];
                for (const p of sampleProducts) {
                    await this.product.upsert({
                        where: { slug: p.slug },
                        update: {},
                        create: { merchantId: merchantUser.id, ...p },
                    });
                }
                this.logger.log('  Seeded 5 sample products');
            }
            const bannerData = [
                { title: '广西非遗皮雕艺术节', image: '/images/placeholders/hero-workshop-placeholder.png', link: '/shop?isGuangxi=true', position: 'shop', sortOrder: 1, isActive: true },
                { title: '皮雕入门工具特惠', image: '/images/placeholders/course-cover-placeholder.png', link: '/shop?category=leather-tools', position: 'shop', sortOrder: 2, isActive: true },
            ];
            for (const b of bannerData) {
                const existing = await this.banner.findFirst({ where: { title: b.title } });
                if (!existing)
                    await this.banner.create({ data: b });
            }
            this.logger.log('  Seeded 2 shop banners');
            this.logger.log('Seed data initialization completed');
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Seed data failed: ${msg}`);
            throw err;
        }
    }
    isReady() {
        return this.initialized;
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map