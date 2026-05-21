const { expect, test } = require('@playwright/test');

const env = globalThis.process?.env || {};
const baseUrl = env.E2E_BASE_URL || 'http://localhost:3000';
const email = env.E2E_USER_EMAIL;
const password = env.E2E_USER_PASSWORD;
const wrongEmail = env.E2E_WRONG_EMAIL || 'not-exist-e2e@agriai.test';
const wrongPassword = env.E2E_WRONG_PASSWORD || 'wrong-password-e2e';

async function openLoginPage(page) {
  await page.goto(`${baseUrl}/login`);
}

async function submitLogin(page, loginEmail, loginPassword) {
  await page.locator('#email').fill(loginEmail);
  await page.locator('#password').fill(loginPassword);
  await page.locator('button[type="submit"]').click();
}

test.describe('Login', () => {
  test('shows login form', async ({ page }) => {
    await openLoginPage(page);

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('requires email before submitting', async ({ page }) => {
    await openLoginPage(page);

    await page.locator('#password').fill('any-password');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#email')).toBeFocused();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('requires password before submitting', async ({ page }) => {
    await openLoginPage(page);

    await page.locator('#email').fill('user@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#password')).toBeFocused();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('toggles password visibility', async ({ page }) => {
    await openLoginPage(page);

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('button[type="button"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.locator('button[type="button"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('rejects invalid credentials', async ({ page }) => {
    await openLoginPage(page);

    await submitLogin(page, wrongEmail, wrongPassword);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#email')).toBeVisible();
  });

  test('logs in with valid user account', async ({ page }) => {
    test.skip(!email || !password, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD before running this test.');

    await openLoginPage(page);

    await submitLogin(page, email, password);

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator('body')).toContainText(/AgriAI/i);
  });

  test('stores user and auth cookies after successful login', async ({ page, context }) => {
    test.skip(!email || !password, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD before running this test.');

    await openLoginPage(page);

    await submitLogin(page, email, password);
    await expect(page).toHaveURL(/\/home$/);

    const savedUser = await page.evaluate(() => localStorage.getItem('user'));
    expect(savedUser).toBeTruthy();

    const cookies = await context.cookies(baseUrl);
    expect(cookies.some((cookie) => cookie.name === 'accessToken')).toBeTruthy();
    expect(cookies.some((cookie) => cookie.name === 'refreshToken')).toBeTruthy();
  });
});
