const { expect, test } = require('@playwright/test');

const env = globalThis.process?.env || {};
const baseUrl = env.E2E_BASE_URL || 'http://localhost:3000';
const imageFile = {
  name: 'leaf-test.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9]),
};

async function mockCommonApis(page) {
  await page.route('**/api/auth/refresh-token', async (route) => {
    await route.fulfill({ status: 401, body: '' });
  });

  await page.route('**/api/crop-types', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, cropName: 'Rice' },
        { id: 2, cropName: 'Coffee' },
      ]),
    });
  });
}

async function openDiagnosisPage(page) {
  await mockCommonApis(page);
  await page.goto(`${baseUrl}/diagnosis`);
}

function diagnosisButton(page) {
  return page.locator('main button').first();
}

test.describe('Diagnosis UI', () => {
  test('shows upload form and crop selector', async ({ page }) => {
    await openDiagnosisPage(page);

    await expect(page.locator('input[type="file"]')).toHaveCount(1);
    await expect(page.locator('select')).toBeVisible();
    await expect(diagnosisButton(page)).toBeVisible();
  });

  test('keeps submit disabled when image is missing', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.locator('select').selectOption('1');

    await expect(diagnosisButton(page)).toBeDisabled();
  });

  test('shows validation error when crop type is missing', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.locator('input[type="file"]').setInputFiles(imageFile);
    await diagnosisButton(page).click();

    await expect(page.locator('[class*="text-error"]').last()).toBeVisible();
  });

  test('shows selected image preview and file name', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.locator('input[type="file"]').setInputFiles(imageFile);

    await expect(page.locator('img[alt]')).toBeVisible();
    await expect(page.locator('main')).toContainText('leaf-test.jpg');
  });

  test('submits diagnosis and renders successful result', async ({ page }) => {
    await openDiagnosisPage(page);

    let requestCount = 0;
    await page.route('**/api/diagnosis', async (route) => {
      requestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 101,
          originalImageUrl: 'https://example.test/leaf-test.jpg',
          weather: { temperature: 29, humidity: 76, rainfall: 2.5 },
          diseases: [
            {
              diseaseId: 7,
              diseaseCode: 'BLAST',
              diseaseName: 'Leaf Blast',
              confidence: 0.91,
              severity: 'NANG',
            },
          ],
          warnings: ['Monitor field twice per week'],
          treatments: [],
          sprayPrograms: [],
          interactionWarnings: [],
          weatherAlerts: [],
          diseaseWeatherRisks: [],
          hasInteractionWarning: false,
          interactionSummary: '',
          userGuidance: 'Remove infected leaves and monitor the field.',
          isHealthy: false,
          gpsUsed: false,
          diagnosisType: 'DISEASE_DETECTED',
        }),
      });
    });

    await page.locator('select').selectOption('1');
    await page.locator('input[type="file"]').setInputFiles(imageFile);
    await diagnosisButton(page).click();

    await expect.poll(() => requestCount).toBe(1);
    await expect(page.locator('main')).toContainText('Leaf Blast');
    await expect(page.locator('main')).toContainText('91%');
    await expect(page.locator('main')).toContainText('Remove infected leaves');
  });

  test('shows user friendly error when diagnosis API fails', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.route('**/api/diagnosis', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal failure' }),
      });
    });

    await page.locator('select').selectOption('1');
    await page.locator('input[type="file"]').setInputFiles(imageFile);
    await diagnosisButton(page).click();

    await expect(page.locator('[class*="text-error"]').last()).toBeVisible();
  });
});
