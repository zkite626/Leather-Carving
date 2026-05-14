import { Page, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Test user credentials (from seed data)
export const TEST_USERS = {
  learner: { email: 'learner@test.com', password: 'Test1234!', name: '测试学员' },
  teacher: { email: 'teacher@test.com', password: 'Test1234!', name: '测试教师' },
  admin: { email: 'admin@test.com', password: 'Test1234!', name: '测试管理员' },
};

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/邮箱|email/i).fill(email);
  await page.getByLabel(/密码|password/i).fill(password);
  await page.getByRole('button', { name: /登录|sign in/i }).click();
  await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
}

export async function register(page: Page, data: { email: string; password: string; nickname: string }) {
  await page.goto('/register');
  await page.getByLabel(/昵称|nickname/i).fill(data.nickname);
  await page.getByLabel(/邮箱|email/i).fill(data.email);
  await page.getByLabel(/密码|password/i).first().fill(data.password);
  // Fill confirm password if exists
  const confirmField = page.getByLabel(/确认密码|confirm/i);
  if (await confirmField.isVisible()) {
    await confirmField.fill(data.password);
  }
  await page.getByRole('button', { name: /注册|sign up/i }).click();
}
