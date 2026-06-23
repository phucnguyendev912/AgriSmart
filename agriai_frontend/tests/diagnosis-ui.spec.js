const { expect, test } = require('@playwright/test');

const env = globalThis.process?.env || {};
const baseUrl = env.E2E_BASE_URL || 'http://localhost:3000';
const imageFile = {
  name: 'leaf-test.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9]),
};

async function mockCommonApis(page) {
  // Grant permission if supported
  try {
    await page.context().grantPermissions(['geolocation']);
  } catch (e) {
    // Ignore error if webkit/browser doesn't support context-level grant
  }

  // Mock navigator.geolocation before page loading
  await page.addInitScript(() => {
    const mockGeolocation = {
      getCurrentPosition: (success) => {
        setTimeout(() => {
          success({
            coords: {
              latitude: 10.5,
              longitude: 106.5,
              accuracy: 10,
            },
            timestamp: Date.now(),
          });
        }, 50);
      },
      watchPosition: (success) => {
        setTimeout(() => {
          success({
            coords: {
              latitude: 10.5,
              longitude: 106.5,
              accuracy: 10,
            },
            timestamp: Date.now(),
          });
        }, 50);
        return 1;
      },
      clearWatch: () => {},
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });
  });

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
  return page.locator('button:has-text("Chẩn đoán ngay")');
}

async function selectCrop(page, cropName) {
  await page.locator('button:has-text("Chọn loại cây...")').click();
  const option = page.locator(`button:has-text("${cropName}")`);
  await option.waitFor({ state: 'visible' });
  await option.click();
}

test.describe('Diagnosis UI', () => {
  test('shows upload form and crop selector', async ({ page }) => {
    await openDiagnosisPage(page);

    await expect(page.locator('input[type="file"]')).toHaveCount(2);
    await expect(page.locator('button:has-text("Chọn loại cây...")')).toBeVisible();
    await expect(diagnosisButton(page)).toBeVisible();
  });

  test('keeps submit disabled when image is missing', async ({ page }) => {
    await openDiagnosisPage(page);

    await selectCrop(page, 'Rice');

    await expect(diagnosisButton(page)).toBeDisabled();
  });

  test('shows validation error when crop type is missing', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.locator('input[type="file"]').first().setInputFiles(imageFile);
    await expect(diagnosisButton(page)).toBeEnabled();
    await diagnosisButton(page).click();

    await expect(page.locator('[class*="text-error"]').last()).toBeVisible();
  });

  test('shows selected image preview and file name', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.locator('input[type="file"]').first().setInputFiles(imageFile);

    await expect(page.locator('img[alt]')).toBeVisible();
    await expect(page.locator('main')).toContainText('leaf-test.jpg');
  });

  test('submits diagnosis and renders successful result', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.route('**/api/diagnosis', async (route) => {
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

    await selectCrop(page, 'Rice');
    await page.locator('input[type="file"]').first().setInputFiles(imageFile);
    await expect(diagnosisButton(page)).toBeEnabled();
    await diagnosisButton(page).click();

    await expect(page.locator('main')).toContainText('Leaf Blast', { timeout: 10000 });
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

    await selectCrop(page, 'Rice');
    await page.locator('input[type="file"]').first().setInputFiles(imageFile);
    await expect(diagnosisButton(page)).toBeEnabled();
    await diagnosisButton(page).click();

    await expect(page.locator('[class*="text-error"]').last()).toBeVisible({ timeout: 10000 });
  });

  test('cancels in-progress diagnosis request and stops loading', async ({ page }) => {
    await openDiagnosisPage(page);

    await page.route('**/api/diagnosis', async (route) => {
      // delay response to allow cancellation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.abort('aborted');
    });

    await selectCrop(page, 'Rice');
    await page.locator('input[type="file"]').first().setInputFiles(imageFile);
    await expect(diagnosisButton(page)).toBeEnabled();
    await diagnosisButton(page).click();

    // Wait for progress/loading text to appear
    await expect(page.locator('main')).toContainText('Đang phân tích hình ảnh...', { timeout: 10000 });

    // Click "Hủy chẩn đoán"
    await page.locator('button:has-text("Hủy chẩn đoán")').click();

    // Verify it returned to the initial state
    await expect(page.locator('main')).not.toContainText('Đang phân tích hình ảnh...');
    await expect(diagnosisButton(page)).toBeVisible();
  });
});
