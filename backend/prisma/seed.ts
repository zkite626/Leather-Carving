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
