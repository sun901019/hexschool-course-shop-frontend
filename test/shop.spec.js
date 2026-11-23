import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('商品頁分頁、分類、搜尋、缺貨與重新載入', async ({ page }) => {
  await page.goto('/products');
  const grid = page.locator('.product-grid');
  await expect(grid.locator('article')).toHaveCount(4);
  const firstName = await grid.getByRole('heading').first().innerText();
  await page.getByRole('button', { name: '下一頁' }).click();
  await expect(page.getByText('第 2 / 3 頁')).toBeVisible();
  await expect(grid.getByRole('heading').first()).not.toHaveText(firstName);

  await page.getByRole('combobox', { name: '分類', exact: true }).selectOption({ label: '居家收納' });
  await expect(page.getByRole('status').filter({ hasText: '共 4 件商品' })).toBeVisible();
  await expect(grid.getByRole('heading', { name: '棉布擦拭巾' })).toBeVisible();
  await expect(grid.getByText('目前缺貨')).toBeVisible();

  await page.getByRole('button', { name: '清除' }).click();
  await page.getByLabel('搜尋商品').fill('筆記本');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(grid.getByRole('heading', { name: '方格筆記本' })).toBeVisible();
  await expect(grid.locator('article')).toHaveCount(1);

  await page.getByLabel('搜尋商品').fill('課程不存在測試');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(page.getByRole('heading', { name: '找不到符合的商品' })).toBeVisible();
  await page.route('**/api/v1/products?*', route => route.abort(), { times: 1 });
  await page.getByRole('button', { name: '看所有商品' }).click();
  await expect(page.getByRole('button', { name: '重新載入商品' })).toBeVisible();
  await page.getByRole('button', { name: '重新載入商品' }).click();
  await expect(grid.locator('article')).toHaveCount(4);
});

test('訪客引導、註冊登入、實際購物車同步與登出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const email = 'browser-' + randomUUID() + '@example.test';
  const password = randomUUID();
  await page.goto('/cart');
  await page.getByRole('link', { name: '前往登入' }).click();
  await page.getByRole('link', { name: /註冊會員/ }).click();
  await page.getByLabel('姓名').fill('瀏覽器測試會員');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('密碼', { exact: true }).fill(password);
  await page.getByRole('button', { name: '註冊', exact: true }).click();
  await expect(page.getByText('註冊完成，可以使用剛建立的帳號登入。')).toBeVisible();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('密碼', { exact: true }).fill(password);
  await page.getByRole('button', { name: '登入', exact: true }).click();
  await expect(page.getByRole('heading', { name: '購物車目前是空的' })).toBeVisible();

  await page.getByRole('link', { name: '繼續逛商品' }).click();
  await page.getByLabel('搜尋商品').fill('筆記本');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await page.getByRole('link', { name: /方格筆記本/ }).click();
  await expect(page.getByRole('heading', { name: '方格筆記本' })).toBeVisible();
  await page.getByLabel('款式').selectOption({ label: '米白' });
  await page.getByRole('button', { name: '加入購物車', exact: true }).click();
  await page.getByRole('link', { name: '查看購物車' }).click();
  await expect(page.getByTestId('cart-quantity')).toHaveText('1');
  await page.getByRole('button', { name: '增加方格筆記本數量' }).click();
  await expect(page.getByTestId('cart-quantity')).toHaveText('2');
  await expect(page.getByRole('complementary').getByText('NT$170')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('cart-quantity')).toHaveText('2');
  await page.getByRole('button', { name: '移除方格筆記本' }).click();
  await expect(page.getByRole('heading', { name: '購物車目前是空的' })).toBeVisible();
  await page.getByRole('button', { name: '登出' }).click();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: '登入後查看購物車' })).toBeVisible();
});

for (const width of [320, 390, 1280]) {
  test('首頁、列表與登入在 ' + width + 'px 可操作且沒有溢出', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    for (const [path, heading] of [['/', '辦公室小物電商'], ['/products', '所有商品'], ['/login', '會員登入']]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow, path + ' at ' + width).toBe(false);
    }
    expect(errors).toEqual([]);
  });
}
