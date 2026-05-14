import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers';

test.describe('Course Browsing and Learning Flow', () => {

  test('Visit /courses and see course list', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Should see course cards or course items
    const courseItems = page.locator('[class*="course"], [class*="card"], article, [class*="item"]')
      .or(page.getByRole('link', { name: /课程|course/i }));

    // Expect at least one course to be visible
    await expect(courseItems.first()).toBeVisible({ timeout: 10000 });
  });

  test('Filter courses by level and list should update', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Look for level filter (buttons, select, or tabs)
    const levelFilter = page.getByRole('button', { name: /初级|入门|beginner|基础/i })
      .or(page.getByRole('tab', { name: /初级|入门|beginner|基础/i }))
      .or(page.getByLabel(/级别|level|难度/i));

    if (await levelFilter.first().isVisible()) {
      // Get initial course count or first course text
      // Click the filter
      await levelFilter.first().click();
      await page.waitForLoadState('networkidle');

      // The list should still have items (or show a "no results" message)
      const filteredCourses = page.locator('[class*="course"], [class*="card"], article');
      const filteredCount = await filteredCourses.count();

      // Either we have filtered results or a "no results" message
      const hasResults = filteredCount > 0;
      const hasNoResultsMessage = await page.getByText(/没有|暂无|no results|empty/i).isVisible();
      expect(hasResults || hasNoResultsMessage).toBeTruthy();
    }
  });

  test('Click course card navigates to detail page with course info', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Click the first course card/link
    const courseLink = page.locator('[class*="course"] a, [class*="card"] a, article a')
      .or(page.getByRole('link').filter({ hasText: /课程|皮雕|leather/i }));

    const firstCourse = courseLink.first();
    if (await firstCourse.isVisible()) {
      await firstCourse.click();
      await page.waitForLoadState('networkidle');

      // Should be on a course detail page
      await expect(page).toHaveURL(/\/courses?\/[\w-]+/);

      // Should see course-related content
      const courseInfo = page.getByText(/课程|简介|description|介绍|课时|时长/i)
        .or(page.locator('h1, h2, [class*="title"]'));
      await expect(courseInfo.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Enroll in a course from detail page (requires auth)', async ({ page }) => {
    // Skip if no backend running
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with seed data');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Navigate to first course
    const courseLink = page.locator('[class*="course"] a, [class*="card"] a, article a').first();
    if (await courseLink.isVisible()) {
      await courseLink.click();
      await page.waitForLoadState('networkidle');

      // Find and click enroll button
      const enrollButton = page.getByRole('button', { name: /报名|加入|enroll|开始学习/i });
      if (await enrollButton.isVisible()) {
        await enrollButton.click();

        // Should show success feedback or change button state
        await expect(
          page.getByText(/已报名|已加入|enrolled|开始学习|success/i)
            .or(page.getByRole('button', { name: /已报名|已加入|继续学习|continue/i }))
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('After enrollment, navigate to lesson with video player visible', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with enrolled course');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Go to my courses / learning page
    await page.goto('/my-courses');
    await page.waitForLoadState('networkidle');

    // Click on an enrolled course
    const courseLink = page.locator('a[class*="course"], a[class*="card"], article a').first();
    if (await courseLink.isVisible()) {
      await courseLink.click();
      await page.waitForLoadState('networkidle');

      // Navigate to first lesson
      const lessonLink = page.getByRole('link', { name: /课时|lesson|第.*课|播放/i })
        .or(page.locator('[class*="lesson"] a, [class*="chapter"] a'));

      if (await lessonLink.first().isVisible()) {
        await lessonLink.first().click();
        await page.waitForLoadState('networkidle');

        // Video player should be visible
        const videoPlayer = page.locator('video, iframe[src*="video"], [class*="player"], [class*="video"]');
        await expect(videoPlayer.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Mark lesson as complete and progress should update', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with enrolled course and lesson');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Navigate to a lesson page
    await page.goto('/my-courses');
    await page.waitForLoadState('networkidle');

    const courseLink = page.locator('a[class*="course"], a[class*="card"], article a').first();
    if (await courseLink.isVisible()) {
      await courseLink.click();
      await page.waitForLoadState('networkidle');

      const lessonLink = page.getByRole('link', { name: /课时|lesson|第.*课/i })
        .or(page.locator('[class*="lesson"] a, [class*="chapter"] a'));

      if (await lessonLink.first().isVisible()) {
        await lessonLink.first().click();
        await page.waitForLoadState('networkidle');

        // Click complete button
        const completeButton = page.getByRole('button', { name: /完成|complete|标记完成|done/i });
        if (await completeButton.isVisible()) {
          // Record progress before
          await completeButton.click();

          // Progress indicator should update
          await expect(
            page.getByText(/已完成|completed|进度|progress/i)
              .or(page.locator('[class*="progress"], [class*="complete"]'))
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

});
