import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://lc_user:lc_password@localhost:5432/leather_carving?schema=public',
  },
});
