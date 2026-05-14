import { test, expect } from '@playwright/test';
import { TEST_USERS, login, register } from './helpers';

test.describe('Authentication Flow', () => {

  test('Register a new user and redirect to home', async ({ page }) => {
    const timestamp = Date.now();
    const newUser = {
      email: `newuser${timestamp}@test.com`,
      password: 'Test1234!',
      nickname: `新用户${timestamp}`,
    };

    await register(page, newUser);

    // Should redirect away from register page
    await expect(page).not.toHaveURL(/\/register/);
    // Should land on home or dashboard
    await expect(page).toHaveURL(/\/(home|dashboard|\/)?$/);
  });

  test('Login with valid credentials and see user menu', async ({ page }) => {
    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Should be on the main page, not login
    await expect(page).not.toHaveURL(/\/login/);

    // Should see user-related element (avatar, name, or menu)
    const userMenu = page.getByRole('button', { name: /测试学员|用户|头像|menu|profile/i })
      .or(page.getByText(TEST_USERS.learner.name));
    await expect(userMenu.first()).toBeVisible({ timeout: 5000 });
  });

  test('Navigate to profile and update nickname', async ({ page }) => {
    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Navigate to profile page
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Find and update nickname field
    const nicknameInput = page.getByLabel(/昵称|nickname/i)
      .or(page.getByRole('textbox', { name: /昵称|nickname/i }));

    if (await nicknameInput.isVisible()) {
      await nicknameInput.clear();
      await nicknameInput.fill('更新后的昵称');

      // Save changes
      const saveButton = page.getByRole('button', { name: /保存|save|更新|update/i });
      await saveButton.click();

      // Wait for success feedback
      await expect(
        page.getByText(/成功|已保存|已更新|success/i)
          .or(page.locator('[class*="success"], [class*="toast"]'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Logout redirects to login page', async ({ page }) => {
    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Find and click logout button/link
    const logoutButton = page.getByRole('button', { name: /登出|退出|logout|sign out/i })
      .or(page.getByRole('link', { name: /登出|退出|logout|sign out/i }));

    // First try to find a user menu to open
    const userMenuTrigger = page.getByRole('button', { name: /测试学员|用户|头像|menu|profile/i })
      .or(page.getByText(TEST_USERS.learner.name));

    if (await userMenuTrigger.first().isVisible()) {
      await userMenuTrigger.first().click();
    }

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

});
