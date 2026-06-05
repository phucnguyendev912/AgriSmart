const { expect, test } = require('@playwright/test');

const env = globalThis.process?.env || {};
const apiUrl = env.E2E_API_URL || 'http://localhost:8080';
const runRealSuccess = env.E2E_DIAGNOSIS_RUN_REAL_SUCCESS === 'true';
const imageFile = {
  name: 'leaf-test.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9]),
};

async function getFirstCropTypeId(request) {
  const response = await request.get(`${apiUrl}/api/crop-types`);
  expect(response.ok()).toBeTruthy();

  const cropTypes = await response.json();
  expect(Array.isArray(cropTypes)).toBeTruthy();
  expect(cropTypes.length).toBeGreaterThan(0);

  return String(cropTypes[0].id);
}

test.describe('Diagnosis API', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'API tests run once on Chromium project.');
  });

  test('rejects request without image', async ({ request }) => {
    const cropTypeId = await getFirstCropTypeId(request);

    const response = await request.post(`${apiUrl}/api/diagnosis`, {
      multipart: {
        cropTypeId,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  test('rejects request without crop type', async ({ request }) => {
    const response = await request.post(`${apiUrl}/api/diagnosis`, {
      multipart: {
        image: imageFile,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  test('rejects unknown crop type id', async ({ request }) => {
    const response = await request.post(`${apiUrl}/api/diagnosis`, {
      multipart: {
        cropTypeId: '999999',
        image: imageFile,
      },
    });

    expect([400, 404]).toContain(response.status());
    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  test('accepts valid multipart diagnosis request when real external services are enabled', async ({ request }) => {
    test.skip(!runRealSuccess, 'Set E2E_DIAGNOSIS_RUN_REAL_SUCCESS=true only when Cloudinary and Vision AI are ready.');

    const cropTypeId = await getFirstCropTypeId(request);

    const response = await request.post(`${apiUrl}/api/diagnosis`, {
      multipart: {
        cropTypeId,
        image: imageFile,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('diagnosisType');
    expect(body).toHaveProperty('diseases');
    expect(body).toHaveProperty('warnings');
  });
});
