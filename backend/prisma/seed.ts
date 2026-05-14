import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://lc_user:lc_password@localhost:5432/leather_carving?schema=public';
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

interface SeedUser {
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
  phone?: string;
}

const seedUsers: SeedUser[] = [
  {
    email: 'admin@leather-carving.com',
    password: 'Admin123!',
    nickname: '超级管理员',
    role: UserRole.ADMIN,
    phone: '13800000001',
  },
  {
    email: 'teacher@leather-carving.com',
    password: 'Teacher123!',
    nickname: '示范教师',
    role: UserRole.TEACHER,
    phone: '13800000002',
  },
  {
    email: 'merchant@leather-carving.com',
    password: 'Merchant123!',
    nickname: '示范商家',
    role: UserRole.MERCHANT,
    phone: '13800000003',
  },
  {
    email: 'learner@leather-carving.com',
    password: 'Learner123!',
    nickname: '示范学员',
    role: UserRole.LEARNER,
    phone: '13800000004',
  },
];

async function main(): Promise<void> {
  console.log('Seeding database...');

  for (const userData of seedUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash,
        nickname: userData.nickname,
        role: userData.role,
        phone: userData.phone,
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    console.log(`  Created user: ${user.email} (${user.role})`);
  }

  // Create teacher profile for the teacher user
  const teacherUser = await prisma.user.findUnique({
    where: { email: 'teacher@leather-carving.com' },
  });

  if (teacherUser) {
    await prisma.teacherProfile.upsert({
      where: { userId: teacherUser.id },
      update: {},
      create: {
        userId: teacherUser.id,
        title: '资深皮雕工艺师',
        specialties: ['皮雕', '植鞣革', '皮具制作'],
        experience: 10,
        introduction: '拥有十年皮雕教学经验，擅长将传统工艺与现代设计相结合。',
        isVerified: true,
        certifications: {
          items: [
            '国家高级工艺美术师',
            '广西非物质文化遗产传承人',
          ],
        },
      },
    });
    console.log('  Created teacher profile');
  }

  // Create a sample product category
  await prisma.productCategory.upsert({
    where: { slug: 'leather-tools' },
    update: {},
    create: {
      name: '皮雕工具',
      slug: 'leather-tools',
      icon: 'tool',
      sortOrder: 1,
    },
  });

  const materialCategory = await prisma.productCategory.upsert({
    where: { slug: 'leather-materials' },
    update: {},
    create: {
      name: '皮料辅料',
      slug: 'leather-materials',
      icon: 'layers',
      sortOrder: 2,
    },
  });

  // Create a subcategory
  await prisma.productCategory.upsert({
    where: { slug: 'vegetable-tanned' },
    update: {},
    create: {
      name: '植鞣革',
      slug: 'vegetable-tanned',
      parentId: materialCategory.id,
      sortOrder: 1,
    },
  });

  console.log('  Created product categories');

  // Create sample products
  const merchantUser = await prisma.user.findUnique({
    where: { email: 'merchant@leather-carving.com' },
  });

  if (merchantUser) {
    const toolsCategory = await prisma.productCategory.findUnique({
      where: { slug: 'leather-tools' },
    });
    const vtCategory = await prisma.productCategory.findUnique({
      where: { slug: 'vegetable-tanned' },
    });

    if (toolsCategory && vtCategory) {
      const sampleProducts = [
        {
          name: '壮锦纹样雕刻工具套装',
          slug: 'zhuangjin-carving-tool-set',
          description: '精选优质钢材打造，包含10把不同规格的皮雕工具，适合雕刻壮锦传统纹样。手柄采用红木材质，握感舒适。',
          price: 298.00,
          originalPrice: 398.00,
          stock: 50,
          stockAlert: 10,
          sales: 128,
          rating: 4.80,
          status: 'ON_SALE' as const,
          isGuangxi: true,
          categoryId: toolsCategory.id,
          tags: ['工具套装', '壮锦', '皮雕'],
          attributes: { 材质: '高碳钢+红木', 件数: '10件套', 适用: '初学者/进阶' },
        },
        {
          name: '意大利进口植鞣革 A4',
          slug: 'italian-vegetable-tanned-a4',
          description: '意大利进口头层植鞣革，厚度1.2mm，A4尺寸。质地细腻，适合精细皮雕和皮具制作。',
          price: 68.00,
          stock: 200,
          stockAlert: 20,
          sales: 356,
          rating: 4.60,
          status: 'ON_SALE' as const,
          isGuangxi: false,
          categoryId: vtCategory.id,
          tags: ['植鞣革', '进口', 'A4'],
          attributes: { 产地: '意大利', 厚度: '1.2mm', 尺寸: 'A4 (210×297mm)' },
        },
        {
          name: '广西瑶族刺绣皮包',
          slug: 'yao-embroidery-leather-bag',
          description: '融合瑶族传统刺绣工艺与现代皮具设计，手工缝制。采用优质牛皮，搭配瑶族特色图案，兼具实用性与艺术性。',
          price: 588.00,
          originalPrice: 788.00,
          stock: 15,
          stockAlert: 5,
          sales: 42,
          rating: 4.90,
          status: 'ON_SALE' as const,
          isGuangxi: true,
          categoryId: vtCategory.id,
          tags: ['瑶族', '刺绣', '皮包', '非遗'],
          attributes: { 材质: '头层牛皮', 工艺: '手工刺绣+皮雕', 尺寸: '25×18×8cm' },
        },
        {
          name: '喀斯特山水纹皮雕画框',
          slug: 'karst-landscape-leather-frame',
          description: '以广西喀斯特地貌为灵感，手工雕刻山水纹样的皮雕装饰画框。可作为家居装饰或非遗文化礼品。',
          price: 428.00,
          stock: 30,
          stockAlert: 5,
          sales: 86,
          rating: 4.70,
          status: 'ON_SALE' as const,
          isGuangxi: true,
          categoryId: toolsCategory.id,
          tags: ['喀斯特', '装饰画', '皮雕'],
          attributes: { 材质: '植鞣革+实木框', 工艺: '手工皮雕', 尺寸: '30×40cm' },
        },
        {
          name: '皮雕入门教程套装',
          slug: 'beginner-carving-starter-kit',
          description: '包含基础皮雕工具3件、练习皮革2片、教程手册1本。适合零基础入门学习皮雕技艺。',
          price: 128.00,
          stock: 100,
          stockAlert: 15,
          sales: 520,
          rating: 4.50,
          status: 'ON_SALE' as const,
          isGuangxi: false,
          categoryId: toolsCategory.id,
          tags: ['入门', '教程', '套装'],
          attributes: { 包含: '工具3件+皮革2片+教程', 适用: '零基础' },
        },
      ];

      for (const productData of sampleProducts) {
        await prisma.product.upsert({
          where: { slug: productData.slug },
          update: {},
          create: {
            merchantId: merchantUser.id,
            ...productData,
          },
        });
      }
      console.log('  Created sample products');
    } else {
      console.log('  Skipping products: categories not found');
    }
  }

  // Create sample shop banners
  const banners = [
    {
      title: '广西非遗皮雕艺术节',
      image: '/images/placeholders/hero-workshop-placeholder.png',
      link: '/shop?isGuangxi=true',
      position: 'shop',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: '皮雕入门工具特惠',
      image: '/images/placeholders/course-cover-placeholder.png',
      link: '/shop?category=leather-tools',
      position: 'shop',
      sortOrder: 2,
      isActive: true,
    },
  ];

  for (const bannerData of banners) {
    const existing = await prisma.banner.findFirst({
      where: { title: bannerData.title },
    });
    if (!existing) {
      await prisma.banner.create({ data: bannerData });
    }
  }
  console.log('  Created sample banners');

  console.log('Seeding completed.');
}

main()
  .catch((e: unknown) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
