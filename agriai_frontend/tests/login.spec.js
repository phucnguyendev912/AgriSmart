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

async function fulfillJson(route, status, body) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockLoggedOutSession(page) {
  let refreshTokenCalls = 0;

  await page.route('**/api/auth/refresh-token', async (route) => {
    refreshTokenCalls += 1;
    await fulfillJson(route, 401, { message: 'Refresh token không hợp lệ.' });
  });

  return () => refreshTokenCalls;
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

  test('keeps invalid credential errors on login page without refreshing token', async ({ page }) => {
    const getRefreshTokenCalls = await mockLoggedOutSession(page);

    await page.route('**/api/auth/login', async (route) => {
      await fulfillJson(route, 401, {
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    });

    await openLoginPage(page);
    await expect(page.locator('#email')).toBeVisible();

    const refreshCallsBeforeLogin = getRefreshTokenCalls();
    await submitLogin(page, wrongEmail, wrongPassword);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).toContainText(/Tài khoản hoặc mật khẩu không chính xác/i);
    expect(getRefreshTokenCalls()).toBe(refreshCallsBeforeLogin);
  });

  test('shows a system error when login API returns server error', async ({ page }) => {
    await mockLoggedOutSession(page);

    await page.route('**/api/auth/login', async (route) => {
      await fulfillJson(route, 500, {
        message: 'Có lỗi xảy ra, vui lòng thử lại sau',
      });
    });

    await openLoginPage(page);
    await submitLogin(page, wrongEmail, wrongPassword);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).toContainText(/Lỗi hệ thống hoặc kết nối máy chủ/i);
    await expect(page.locator('body')).not.toContainText(/Email hoặc mật khẩu không đúng/i);
  });

  test('shows a network error when login API is unreachable', async ({ page }) => {
    await mockLoggedOutSession(page);

    await page.route('**/api/auth/login', async (route) => {
      await route.abort('failed');
    });

    await openLoginPage(page);
    await submitLogin(page, wrongEmail, wrongPassword);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).toContainText(/Không thể kết nối đến máy chủ/i);
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
