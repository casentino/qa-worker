import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await page.getByLabel('검색', { exact: true }).click();
  await page.getByText('Google 검색 I’m Feeling Lucky').nth(1).click();
});