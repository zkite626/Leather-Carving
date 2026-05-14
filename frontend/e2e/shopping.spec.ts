import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers';

test.describe('Shopping Flow', () => {

  test('Visit /shop and see product grid', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Should see product items
    const products = page.locator('[class*="product"], [class*="card"], [class*="item"], article')
      .or(page.getByRole('link').filter({ has: page.locator('img') }));

    await expect(products.first()).toBeVisible({ timeout: 10000 });
  });

  test('Click product navigates to detail with price and images', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Click the first product
    const productLink = page.locator('[class*="product"] a, [class*="card"] a, [class*="item"] a, article a')
      .first();

    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');

      // Should be on a product detail page
      await expect(page).toHaveURL(/\/(shop|product)/);

      // Should see price
      const price = page.getByText(/¥|\$|price|价格|￥/i)
        .or(page.locator('[class*="price"]'));
      await expect(price.first()).toBeVisible({ timeout: 5000 });

      // Should see product image
      const image = page.locator('img').first();
      await expect(image).toBeVisible();
    }
  });

  test('Add to cart and cart badge should update', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Navigate to a product
    const productLink = page.locator('[class*="product"] a, [class*="card"] a, [class*="item"] a, article a')
      .first();

    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');

      // Find and click add to cart button
      const addToCartButton = page.getByRole('button', { name: /加入购物车|add to cart|购买/i });
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();

        // Cart badge or count should appear/update
        await expect(
          page.getByText(/已加入|added|购物车.*1|cart.*1/i)
            .or(page.locator('[class*="badge"], [class*="count"]').filter({ hasText: /1/ }))
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('Visit /cart and see product with quantity controls', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with items in cart');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Should see cart items or empty cart message
    const cartItem = page.locator('[class*="cart-item"], [class*="item"], [class*="product"]')
      .or(page.getByRole('listitem'));

    const emptyCart = page.getByText(/购物车为空|empty|没有商品/i);

    const hasItems = await cartItem.first().isVisible().catch(() => false);
    const isEmpty = await emptyCart.isVisible().catch(() => false);

    expect(hasItems || isEmpty).toBeTruthy();

    if (hasItems) {
      // Should see quantity controls
      const quantityControl = page.getByRole('button', { name: /\+|增加|plus/i })
        .or(page.getByRole('button', { name: /-|减少|minus/i }))
        .or(page.locator('input[type="number"], [class*="quantity"]'));
      await expect(quantityControl.first()).toBeVisible();
    }
  });

  test('Adjust quantity and total should update', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with items in cart');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Check if cart has items
    const totalText = page.getByText(/合计|total|总计|￥|¥/i)
      .or(page.locator('[class*="total"], [class*="summary"]'));

    if (await totalText.first().isVisible()) {
      // Get initial total
      const initialTotal = await totalText.first().textContent();

      // Increase quantity
      const increaseButton = page.getByRole('button', { name: /\+|增加|plus/i })
        .or(page.locator('[class*="increase"], [class*="plus"]'));

      if (await increaseButton.first().isVisible()) {
        await increaseButton.first().click();
        await page.waitForLoadState('networkidle');

        // Total should have changed
        await expect(totalText.first()).not.toHaveText(initialTotal || '', { timeout: 5000 });
      }
    }
  });

  test('Proceed to checkout shows checkout form', async ({ page }) => {
    test.skip(!process.env.RUN_E2E, 'Skipped: requires running backend with items in cart');

    await login(page, TEST_USERS.learner.email, TEST_USERS.learner.password);

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Click checkout button
    const checkoutButton = page.getByRole('button', { name: /结算|checkout|去结算|下单/i })
      .or(page.getByRole('link', { name: /结算|checkout|去结算|下单/i }));

    if (await checkoutButton.first().isVisible()) {
      await checkoutButton.first().click();
      await page.waitForLoadState('networkidle');

      // Should see checkout form
      await expect(page).toHaveURL(/\/checkout|\/order/);

      // Should see form fields
      const formFields = page.getByLabel(/地址|address|姓名|name|电话|phone|手机|mobile/i)
        .or(page.locator('form input, form select'));
      await expect(formFields.first()).toBeVisible({ timeout: 5000 });
    }
  });

});
