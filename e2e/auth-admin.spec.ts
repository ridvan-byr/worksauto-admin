import { test, expect } from '@playwright/test';

test.describe('E2E Admin Route Guard', () => {
  test('admin portal requires admin authentication', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin\/login/);
  });
});
