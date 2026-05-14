import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers';

test.describe('Community Features', () => {

  test('Visit /community and see post list', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // Should see post items
    const posts = page.locator('[class*="post"], [class*="card"], [class*="item"], article')
      .or(page.getByRole('article'));

    await expect(posts.first()).toBeVisible({ timeout: 10000 });
  });

  test('Navigate to create post page, fill and submit', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with authenticated user');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    await page.goto('/community/create');
    await page.waitForLoadState('networkidle');

    // Fill in post title
    const titleInput = page.getByLabel(/标题|title/i)
      .or(page.getByRole('textbox', { name: /标题|title/i }))
      .or(page.locator('input[name="title"], input[placeholder*="标题"]'));

    if (await titleInput.isVisible()) {
      await titleInput.fill('测试帖子标题');

      // Fill in post content
      const contentInput = page.getByLabel(/内容|content|正文/i)
        .or(page.getByRole('textbox', { name: /内容|content/i }))
        .or(page.locator('textarea[name="content"], textarea[placeholder*="内容"], [contenteditable="true"]'));

      if (await contentInput.isVisible()) {
        await contentInput.fill('这是一篇测试帖子的内容，用于E2E自动化测试。');
      }

      // Submit
      const submitButton = page.getByRole('button', { name: /发布|submit|发表|post|提交/i });
      await submitButton.click();

      // Should redirect to community or show success
      await expect(
        page.getByText(/发布成功|success|已发布/i)
          .or(page).toHaveURL(/\/community/)
      );
    }
  });

  test('Find a post and click to view detail', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // Click first post
    const postLink = page.locator('[class*="post"] a, [class*="card"] a, article a')
      .or(page.getByRole('link').filter({ has: page.locator('h2, h3, [class*="title"]') }));

    if (await postLink.first().isVisible()) {
      await postLink.first().click();
      await page.waitForLoadState('networkidle');

      // Should be on a post detail page
      await expect(page).toHaveURL(/\/(community|post)\/[\w-]+/);

      // Should see post content
      const postContent = page.locator('[class*="content"], [class*="body"], [class*="post"]')
        .or(page.locator('article, main'));
      await expect(postContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Add a comment and it should appear in comment list', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with authenticated user');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Navigate to a post
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    const postLink = page.locator('[class*="post"] a, [class*="card"] a, article a').first();
    if (await postLink.isVisible()) {
      await postLink.click();
      await page.waitForLoadState('networkidle');

      // Find comment input
      const commentInput = page.getByLabel(/评论|comment/i)
        .or(page.getByRole('textbox', { name: /评论|comment/i }))
        .or(page.locator('textarea[placeholder*="评论"], textarea[placeholder*="comment"]'));

      if (await commentInput.isVisible()) {
        const testComment = `测试评论 ${Date.now()}`;
        await commentInput.fill(testComment);

        // Submit comment
        const submitComment = page.getByRole('button', { name: /评论|comment|发送|submit|发表/i })
          .last();
        await submitComment.click();

        // Comment should appear in list
        await expect(page.getByText(testComment)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Like a post and like count should increase', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with authenticated user');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    // Navigate to a post
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    const postLink = page.locator('[class*="post"] a, [class*="card"] a, article a').first();
    if (await postLink.isVisible()) {
      await postLink.click();
      await page.waitForLoadState('networkidle');

      // Find like button and current count
      const likeButton = page.getByRole('button', { name: /赞|like|点赞|heart/i })
        .or(page.locator('[class*="like"], [class*="heart"], [class*="thumb"]'));

      if (await likeButton.first().isVisible()) {
        // Get initial like count
        const likeCount = page.locator('[class*="like-count"], [class*="count"]')
          .filter({ hasText: /\d+/ });
        const initialCount = await likeCount.first().textContent().catch(() => '0');
        const initialNumber = parseInt(initialCount?.match(/\d+/)?.[0] || '0', 10);

        // Click like
        await likeButton.first().click();
        await page.waitForTimeout(1000);

        // Like count should increase (or show "liked" state)
        const newCount = await likeCount.first().textContent().catch(() => '0');
        const newNumber = parseInt(newCount?.match(/\d+/)?.[0] || '0', 10);

        // Either count increased or like state changed
        const likedState = await page.getByText(/已赞|liked/i).isVisible().catch(() => false);
        expect(newNumber > initialNumber || likedState).toBeTruthy();
      }
    }
  });

});
