import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '..', '.env') });

export default defineConfig({
  schema: resolve(__dirname, 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
