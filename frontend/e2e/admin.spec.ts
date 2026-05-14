import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers';

test.describe('Admin Functionality', () => {

  test('Login as admin and navigate to admin dashboard', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with admin user');

    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should see admin dashboard content
    await expect(page).toHaveURL(/\/admin/);

    // Should see dashboard elements (stats, charts, or summary cards)
    const dashboardContent = page.getByText(/dashboard|仪表盘|管理|总览|统计/i)
      .or(page.locator('[class*="dashboard"], [class*="stat"], [class*="card"], [class*="chart"]'));
    await expect(dashboardContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('Navigate to /admin/users and see user table', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with admin user');

    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should see a table or list of users
    const userTable = page.locator('table, [class*="table"], [class*="user-list"], [role="table"]')
      .or(page.getByRole('table'));

    await expect(userTable.first()).toBeVisible({ timeout: 10000 });

    // Table should have rows
    const rows = page.locator('table tbody tr, [class*="row"], [class*="user-item"]');
    await expect(rows.first()).toBeVisible({ timeout: 5000 });
  });

  test('Find a user and change their role', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with admin user and multiple users');

    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Find a user row (not admin itself)
    const userRow = page.locator('table tbody tr, [class*="user-item"], [class*="row"]')
      .filter({ hasText: /test|测试|@/ });

    if (await userRow.first().isVisible()) {
      // Look for role selector or edit button
      const roleSelector = userRow.first().locator('select, [class*="role"], [class*="select"]')
        .or(page.getByRole('combobox').first());

      const editButton = userRow.first().getByRole('button', { name: /编辑|edit|修改|角色|role/i });

      if (await roleSelector.isVisible()) {
        // Direct role change via select
        await roleSelector.selectOption({ label: /教师|teacher/i });
      } else if (await editButton.isVisible()) {
        // Open edit modal/form
        await editButton.click();
        await page.waitForLoadState('networkidle');

        // Change role
        const roleField = page.getByLabel(/角色|role/i)
          .or(page.getByRole('combobox'));
        if (await roleField.first().isVisible()) {
          await roleField.first().selectOption({ label: /教师|teacher/i });
        }

        // Save changes
        const saveButton = page.getByRole('button', { name: /保存|save|确认|confirm/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }

      // Should show success feedback
      await expect(
        page.getByText(/成功|success|已更新|已修改/i)
          .or(page.locator('[class*="success"], [class*="toast"]'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Navigate to /admin/content and see content review queue', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with admin user');

    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.goto('/admin/content');
    await page.waitForLoadState('networkidle');

    // Should see content review list or queue
    const contentList = page.locator('table, [class*="list"], [class*="queue"], [class*="content-item"]')
      .or(page.getByRole('table'))
      .or(page.getByRole('list'));

    const emptyState = page.getByText(/暂无|没有待审核|no content|empty/i);

    const hasContent = await contentList.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    // Either there is content to review or a meaningful empty state
    expect(hasContent || isEmpty).toBeTruthy();
  });

});
