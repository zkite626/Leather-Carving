#!/usr/bin/env node

const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const cwd = process.cwd();
const schemaPath = join(cwd, 'prisma', 'schema.prisma');

if (!existsSync(schemaPath)) {
  console.log('[prisma] prisma/schema.prisma not found, skipping Prisma Client generation.');
  process.exit(0);
}

const prismaBin = join(
  cwd,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
);

if (!existsSync(prismaBin)) {
  console.error('[prisma] Prisma CLI is not installed in this package.');
  console.error('[prisma] Run `npm install` in backend/ before building or starting the service.');
  process.exit(1);
}

const result = spawnSync(prismaBin, ['generate', '--schema', schemaPath], {
  cwd,
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const generatedTypesPath = join(cwd, 'node_modules', '.prisma', 'client', 'index.d.ts');
const packageTypesPath = join(cwd, 'node_modules', '@prisma', 'client', 'index.d.ts');

if (!existsSync(generatedTypesPath) || !existsSync(packageTypesPath)) {
  console.error('[prisma] Prisma Client type files were not generated under backend/node_modules.');
  console.error('[prisma] Remove stale node_modules and run `npm ci` from backend/.');
  process.exit(1);
}

const generatedTypes = readFileSync(generatedTypesPath, 'utf8');
const packageTypes = readFileSync(packageTypesPath, 'utf8');
const typeText = `${packageTypes}\n${generatedTypes}`;

const requiredTokens = [
  'export type User',
  'export const UserRole',
  'export const OrderStatus',
  'get user():',
  'get product():',
  'get review():',
  'get systemSetting():',
];

const missingTokens = requiredTokens.filter(token => !typeText.includes(token));

if (missingTokens.length > 0) {
  console.error('[prisma] Generated Prisma Client does not match prisma/schema.prisma.');
  console.error(`[prisma] Missing generated tokens: ${missingTokens.join(', ')}`);
  console.error('[prisma] Delete backend/node_modules and run `npm ci && npm run prisma:generate`.');
  process.exit(1);
}

console.log('[prisma] Prisma Client is generated and verified.');
