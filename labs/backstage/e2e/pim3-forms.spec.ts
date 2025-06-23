import { test, expect } from '@playwright/test';
import { createAuthHelpers } from '@repo/testing/auth-helpers';
import { withPerformanceMonitoring } from './utils/performance-monitor';

/**
 * Tests specifically for the PIM3 form features
 * Validates tabs, multi-selects, and complex relationship management
 */

const timestamp = Date.now();

test.describe('PIM3 Form Features', () => {
  let authHelpers: ReturnType<typeof createAuthHelpers>;
  let testUser: { email: string; password: string };

  test.beforeAll(async () => {
    authHelpers = createAuthHelpers('http://localhost:3300');
    testUser = authHelpers.createTestUser({
      email: `pim-forms-${timestamp}@example.com`,
      name: `PIM Forms ${timestamp}`,
    });
  });

  test.beforeEach(async ({ page }) => {
    await authHelpers.signUpNewUser(page, testUser);
    await authHelpers.signIn(page, testUser);
    await page.goto('/pim3');
  });

  test('Product form - all tabs functional', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForTimeout(300);

    // Verify all tabs are present
    await expect(page.getByRole('tab', { name: 'Basic Info' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Relationships' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Barcodes' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Attributes' })).toBeVisible();

    // Test Basic Info tab (default)
    await expect(page.getByLabel('Product Name')).toBeVisible();
    await expect(page.getByLabel('SKU')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Price')).toBeVisible();

    // Test Relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();
    await expect(page.getByLabel('Collections')).toBeVisible();
    await expect(page.getByLabel('Taxonomies')).toBeVisible();
    await expect(page.getByLabel('Brands')).toBeVisible();

    // Test Barcodes tab
    await page.getByRole('tab', { name: 'Barcodes' }).click();
    await expect(page.getByRole('button', { name: 'Add Barcode' })).toBeVisible();

    // Add a barcode
    await page.getByRole('button', { name: 'Add Barcode' }).click();
    await expect(page.getByPlaceholder('Enter barcode')).toBeVisible();
    await expect(page.getByLabel('Barcode Type')).toBeVisible();
    await expect(page.getByLabel('Primary barcode')).toBeVisible();

    // Test Attributes tab
    await page.getByRole('tab', { name: 'Attributes' }).click();
    await expect(page.getByRole('button', { name: 'Add Attribute' })).toBeVisible();

    // Add an attribute
    await page.getByRole('button', { name: 'Add Attribute' }).click();
    await expect(page.getByPlaceholder('Attribute name')).toBeVisible();
    await expect(page.getByPlaceholder('Attribute value')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Multi-select functionality - search and selection', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForTimeout(300);

    // Fill basic info first
    await page.getByLabel('Product Name').fill('Multi-Select Test');
    await page.getByLabel('SKU').fill('MULTI-SELECT-TEST');

    // Go to relationships
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Test collection multi-select with search
    const collectionsSelect = page.getByLabel('Collections');
    await collectionsSelect.click();

    // Type to search
    await collectionsSelect.fill('test');
    await page.waitForTimeout(300); // Debounce

    // Select filtered results
    const filteredOptions = page.getByRole('option');
    const optionCount = await filteredOptions.count();

    if (optionCount > 0) {
      await filteredOptions.first().click();
    }

    // Clear search and select another
    await collectionsSelect.clear();
    await collectionsSelect.click();

    const allOptions = page.getByRole('option');
    const allCount = await allOptions.count();

    if (allCount > 1) {
      await allOptions.nth(1).click();
    }

    await page.keyboard.press('Escape');

    // Verify selections show as chips
    const selectedChips = page.locator('.mantine-MultiSelect-value');
    const chipCount = await selectedChips.count();
    expect(chipCount).toBeGreaterThanOrEqual(1);

    // Test removing a selection
    if (chipCount > 0) {
      const initialCount = chipCount;
      await selectedChips.first().getByRole('button').click();
      const newCount = selectedChips;
      await expect(newCount).toHaveCount(initialCount - 1);
    }

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Dynamic barcode management', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForTimeout(300);

    // Fill required fields
    await page.getByLabel('Product Name').fill('Barcode Test Product');
    await page.getByLabel('SKU').fill('BARCODE-TEST');
    await page.getByLabel('Price').fill('50');
    await page.getByLabel('Category').click();
    await page.getByRole('option').first().click();
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'SIMPLE' }).click();

    // Go to barcodes tab
    await page.getByRole('tab', { name: 'Barcodes' }).click();

    // Add multiple barcodes
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Add Barcode' }).click();

      const barcodeInputs = page.getByPlaceholder('Enter barcode');
      const lastInput = barcodeInputs.last();
      await lastInput.fill(`12345678900${i}`);

      const typeSelects = page.getByLabel('Barcode Type');
      const lastSelect = typeSelects.last();
      await lastSelect.click();
      await page.getByRole('option', { name: i === 0 ? 'UPC' : 'EAN' }).click();

      // Make first one primary
      if (i === 0) {
        const primaryCheckboxes = page.getByLabel('Primary barcode');
        await primaryCheckboxes.last().check();
      }
    }

    // Verify 3 barcode entries
    const barcodeRows = page.locator('[data-testid="barcode-row"]');
    await expect(barcodeRows).toHaveCount(3);

    // Remove middle barcode
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    await removeButtons.nth(1).click();

    // Verify 2 remain
    await expect(barcodeRows).toHaveCount(2);

    // Save and verify
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Product created successfully' }),
    ).toBeVisible();

    // Re-open and verify barcodes persisted
    const productRow = page.locator('tr').filter({ hasText: 'Barcode Test Product' });
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: 'Barcodes' }).click();
    await expect(page.locator('[data-testid="barcode-row"]')).toHaveCount(2);

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Dynamic attribute management', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForTimeout(300);

    // Fill required fields
    await page.getByLabel('Product Name').fill('Attribute Test Product');
    await page.getByLabel('SKU').fill('ATTR-TEST');
    await page.getByLabel('Price').fill('75');
    await page.getByLabel('Category').click();
    await page.getByRole('option').first().click();
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'SIMPLE' }).click();

    // Go to attributes tab
    await page.getByRole('tab', { name: 'Attributes' }).click();

    // Add multiple attributes
    const attributes = [
      { name: 'Color', value: 'Blue' },
      { name: 'Size', value: 'Large' },
      { name: 'Material', value: 'Cotton' },
    ];

    for (const attr of attributes) {
      await page.getByRole('button', { name: 'Add Attribute' }).click();

      const nameInputs = page.getByPlaceholder('Attribute name');
      const valueInputs = page.getByPlaceholder('Attribute value');

      await nameInputs.last().fill(attr.name);
      await valueInputs.last().fill(attr.value);
    }

    // Verify all attributes are shown
    for (const attr of attributes) {
      await expect(page.getByDisplayValue(attr.name)).toBeVisible();
      await expect(page.getByDisplayValue(attr.value)).toBeVisible();
    }

    // Remove one attribute
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    await removeButtons.nth(1).click(); // Remove 'Size'

    // Verify Size is gone
    await expect(page.getByDisplayValue('Size')).toBeHidden();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Collection form parent hierarchy', async ({ page }) => {
    // Create parent collection first
    await page.getByRole('link', { name: 'Collections' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Collection' }).click();
    await page.waitForTimeout(300);

    await page.getByLabel('Collection Name').fill('Parent Collection');
    await page.getByLabel('Slug').fill('parent-collection');
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'SEASONAL' }).click();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Collection created successfully' }),
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Create child collection
    await page.getByRole('button', { name: 'Add Collection' }).click();
    await page.waitForTimeout(300);

    await page.getByLabel('Collection Name').fill('Child Collection');
    await page.getByLabel('Slug').fill('child-collection');
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'SEASONAL' }).click();

    // Select parent
    const parentSelect = page.getByLabel('Parent Collection');
    await parentSelect.click();
    await page.getByRole('option', { name: 'Parent Collection' }).click();

    // Go to relationships and add some products
    await page.getByRole('tab', { name: 'Relationships' }).click();

    const productsSelect = page.getByLabel('Products');
    await productsSelect.click();
    const productOptions = page.getByRole('option');
    const productCount = await productOptions.count();
    if (productCount > 0) {
      await productOptions.first().click();
    }
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Collection created successfully' }),
    ).toBeVisible();

    // Verify child shows parent in table
    const childRow = page.locator('tr').filter({ hasText: 'Child Collection' });
    await expect(childRow.getByText('Parent Collection')).toBeVisible();
  });

  test('Brand form with product relationships via PdpJoin', async ({ page }) => {
    await page.getByRole('link', { name: 'Brands' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Brand' }).click();
    await page.waitForTimeout(300);

    // Fill brand info
    await page.getByLabel('Brand Name').fill('Test Electronics Brand');
    await page.getByLabel('Slug').fill('test-electronics');
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'MANUFACTURER' }).click();

    // Optional base URL
    await page.getByLabel('Base URL').fill('https://example.com');

    // Go to products tab
    await page.getByRole('tab', { name: 'Products' }).click();

    // Add products via PdpJoin
    const productsSelect = page.getByLabel('Products');
    await productsSelect.click();

    // Select multiple products
    const productOptions = page.getByRole('option');
    const productCount = await productOptions.count();
    const selectCount = Math.min(3, productCount);

    for (let i = 0; i < selectCount; i++) {
      await productOptions.nth(i).click();
    }
    await page.keyboard.press('Escape');

    // Verify selections
    const selectedChips = page.locator('.mantine-MultiSelect-value');
    await expect(selectedChips).toHaveCount(selectCount);

    // Save
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.locator('.mantine-Notification-body').filter({ hasText: 'Brand created successfully' }),
    ).toBeVisible();

    // Verify brand shows product count in table
    const brandRow = page.locator('tr').filter({ hasText: 'Test Electronics Brand' });
    const productBadge = brandRow.locator('.mantine-Badge').filter({ hasText: `${selectCount}` });
    await expect(productBadge).toBeVisible();
  });

  test('Media form with multiple entity associations', async ({ page }) => {
    await page.getByRole('link', { name: 'Media' }).click();
    await page.waitForLoadState('networkidle');

    // Find and edit first media item
    const mediaCards = page.locator('[data-testid="media-card"]');
    const mediaCount = await mediaCards.count();

    if (mediaCount > 0) {
      await mediaCards.first().hover();
      await mediaCards.first().getByRole('button', { name: 'Edit' }).click();
      await page.waitForTimeout(500);

      // Verify tabs
      await expect(page.getByRole('tab', { name: 'Basic Info' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Associations' })).toBeVisible();

      // Update basic info
      await page.getByLabel('Alt Text').clear();
      await page.getByLabel('Alt Text').fill('Updated Alt Text for Testing');

      // Go to associations tab
      await page.getByRole('tab', { name: 'Associations' }).click();

      // Associate with multiple entity types
      const productSelect = page.getByLabel('Associate with Product');
      if (await productSelect.isVisible()) {
        await productSelect.click();
        const productOptions = page.getByRole('option');
        if ((await productOptions.count()) > 0) {
          await productOptions.first().click();
        }
      }

      const collectionSelect = page.getByLabel('Associate with Collection');
      if (await collectionSelect.isVisible()) {
        await collectionSelect.click();
        const collectionOptions = page.getByRole('option');
        if ((await collectionOptions.count()) > 0) {
          await collectionOptions.first().click();
        }
      }

      const brandSelect = page.getByLabel('Associate with Brand');
      if (await brandSelect.isVisible()) {
        await brandSelect.click();
        const brandOptions = page.getByRole('option');
        if ((await brandOptions.count()) > 0) {
          await brandOptions.first().click();
        }
      }

      // Save
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page
          .locator('.mantine-Notification-body')
          .filter({ hasText: 'Media updated successfully' }),
      ).toBeVisible();

      // Verify associations show as badges
      await expect(
        page.locator('.mantine-Badge').filter({ hasText: 'Product' }).first(),
      ).toBeVisible();
      await expect(
        page.locator('.mantine-Badge').filter({ hasText: 'Collection' }).first(),
      ).toBeVisible();
      await expect(
        page.locator('.mantine-Badge').filter({ hasText: 'Brand' }).first(),
      ).toBeVisible();
    }
  });

  test('Form performance with many relationships', async ({ page }) => {
    await withPerformanceMonitoring(
      page,
      async () => {
        await page.getByRole('link', { name: 'Products' }).click();
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: 'Add Product' }).click();
        await page.waitForTimeout(300);

        // Go directly to relationships
        await page.getByRole('tab', { name: 'Relationships' }).click();

        // Measure time to open and render large multi-select
        const startTime = Date.now();

        const collectionsSelect = page.getByLabel('Collections');
        await collectionsSelect.click();

        // Wait for options to be visible
        await expect(page.getByRole('option').first()).toBeVisible();

        const loadTime = Date.now() - startTime;
        console.log(`Multi-select load time: ${loadTime}ms`);

        // Should load quickly even with many options
        expect(loadTime).toBeLessThan(1000); // Less than 1 second

        // Test scrolling performance in dropdown
        const options = page.getByRole('option');
        const optionCount = await options.count();

        if (optionCount > 10) {
          // Scroll to bottom
          await options.last().scrollIntoViewIfNeeded();
          // Scroll back to top
          await options.first().scrollIntoViewIfNeeded();
        }

        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Cancel' }).click();
      },
      {
        customThresholds: {
          FCP: 2000,
          LCP: 3000,
        },
      },
    );
  });
});
