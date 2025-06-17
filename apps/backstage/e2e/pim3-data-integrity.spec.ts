import { test, expect, Page } from '@playwright/test';
import { createAuthHelpers } from '@repo/testing/auth-helpers';

/**
 * Data integrity tests for PIM3 relationships
 * These tests ensure that relationships maintain consistency across entities
 */

const timestamp = Date.now();

// Helper functions
async function createTestProduct(page: Page, name: string, sku: string) {
  await page.getByRole('link', { name: 'Products' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Add Product' }).click();
  await page.waitForTimeout(300);

  await page.getByLabel('Product Name').fill(name);
  await page.getByLabel('SKU').fill(sku);
  await page.getByLabel('Price').fill('100');
  await page.getByLabel('Category').click();
  await page.getByRole('option').first().click();
  await page.getByLabel('Type').click();
  await page.getByRole('option', { name: 'SIMPLE' }).click();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.locator('.mantine-Notification-body').filter({ hasText: 'Product created successfully' }),
  ).toBeVisible();
  await page.waitForTimeout(500);
}

async function createTestCollection(page: Page, name: string, slug: string) {
  await page.getByRole('link', { name: 'Collections' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Add Collection' }).click();
  await page.waitForTimeout(300);

  await page.getByLabel('Collection Name').fill(name);
  await page.getByLabel('Slug').fill(slug);
  await page.getByLabel('Type').click();
  await page.getByRole('option', { name: 'SEASONAL' }).click();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page
      .locator('.mantine-Notification-body')
      .filter({ hasText: 'Collection created successfully' }),
  ).toBeVisible();
  await page.waitForTimeout(500);
}

async function createTestTaxonomy(page: Page, name: string, slug: string) {
  await page.getByRole('link', { name: 'Taxonomies' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Add Taxonomy' }).click();
  await page.waitForTimeout(300);

  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Slug').fill(slug);
  await page.getByLabel('Type').click();
  await page.getByRole('option', { name: 'CATEGORY' }).click();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.locator('.mantine-Notification-body').filter({ hasText: 'Taxonomy created successfully' }),
  ).toBeVisible();
  await page.waitForTimeout(500);
}

test.describe('PIM3 Data Integrity Tests', () => {
  let authHelpers: ReturnType<typeof createAuthHelpers>;
  let testUser: { email: string; password: string };

  test.beforeAll(async () => {
    authHelpers = createAuthHelpers('http://localhost:3300');
    testUser = authHelpers.createTestUser({
      email: `pim-integrity-${timestamp}@example.com`,
      name: `PIM Integrity ${timestamp}`,
    });
  });

  test.beforeEach(async ({ page }) => {
    await authHelpers.signUpNewUser(page, testUser);
    await authHelpers.signIn(page, testUser);
    await page.goto('/pim3');
    await expect(page).toHaveTitle(/Product Information Management/);
  });

  test('Bidirectional relationship sync - Product to Collection', async ({ page }) => {
    // Create test entities
    const productName = `Integrity Product ${timestamp}`;
    const productSku = `INT-SKU-${timestamp}`;
    const collectionName = `Integrity Collection ${timestamp}`;
    const collectionSlug = `integrity-collection-${timestamp}`;

    await createTestProduct(page, productName, productSku);
    await createTestCollection(page, collectionName, collectionSlug);

    // Add product to collection
    await page.getByRole('link', { name: 'Collections' }).click();
    await page.waitForLoadState('networkidle');

    const collectionRow = page.locator('tr').filter({ hasText: collectionName });
    await collectionRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    // Navigate to relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Add the product
    const productsSelect = page.getByLabel('Products');
    await productsSelect.click();
    await page.getByRole('option', { name: productName }).click();
    await page.keyboard.press('Escape');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Collection updated successfully' }),
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Now verify the product shows the collection relationship
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    const productRow = page.locator('tr').filter({ hasText: productName });
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    // Check relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Verify collection is shown in the product's collections
    const collectionChips = page
      .locator('.mantine-MultiSelect-value')
      .filter({ hasText: collectionName });
    await expect(collectionChips).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Cascade relationship removal', async ({ page }) => {
    // Create entities with relationships
    const productName = `Cascade Product ${timestamp}`;
    const productSku = `CASCADE-SKU-${timestamp}`;
    const taxonomyName = `Cascade Taxonomy ${timestamp}`;
    const taxonomySlug = `cascade-taxonomy-${timestamp}`;

    await createTestProduct(page, productName, productSku);
    await createTestTaxonomy(page, taxonomyName, taxonomySlug);

    // Add taxonomy to product
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    const productRow = page.locator('tr').filter({ hasText: productName });
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: 'Relationships' }).click();

    const taxonomiesSelect = page.getByLabel('Taxonomies');
    await taxonomiesSelect.click();
    await page.getByRole('option', { name: taxonomyName }).click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Product updated successfully' }),
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Now remove the taxonomy from the product
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Remove taxonomy by clicking X on chip
    const taxonomyChip = page
      .locator('.mantine-MultiSelect-value')
      .filter({ hasText: taxonomyName });
    await taxonomyChip.getByRole('button').click();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Product updated successfully' }),
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Verify taxonomy no longer shows the product
    await page.getByRole('link', { name: 'Taxonomies' }).click();
    await page.waitForLoadState('networkidle');

    const taxonomyRow = page.locator('tr').filter({ hasText: taxonomyName });
    // Check the product count badge - should be 0
    const productCountBadge = taxonomyRow
      .locator('.mantine-Badge')
      .filter({ hasText: '0 products' });
    await expect(productCountBadge).toBeVisible();
  });

  test('Many-to-many relationship limits and validation', async ({ page }) => {
    // Test that we can add multiple items and remove them
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForTimeout(300);

    // Fill basic info
    await page.getByLabel('Product Name').fill(`Multi Test ${timestamp}`);
    await page.getByLabel('SKU').fill(`MULTI-${timestamp}`);
    await page.getByLabel('Price').fill('50');
    await page.getByLabel('Category').click();
    await page.getByRole('option').first().click();
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'SIMPLE' }).click();

    // Go to relationships
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Add multiple collections
    const collectionsSelect = page.getByLabel('Collections');
    await collectionsSelect.click();

    // Select up to 5 collections if available
    const collectionOptions = page.getByRole('option');
    const collectionCount = await collectionOptions.count();
    const selectCount = Math.min(5, collectionCount);

    for (let i = 0; i < selectCount; i++) {
      await collectionOptions.nth(i).click();
    }
    await page.keyboard.press('Escape');

    // Verify chips show for all selected
    const selectedChips = page.locator('.mantine-MultiSelect-value');
    await expect(selectedChips).toHaveCount(selectCount);

    // Remove middle item
    if (selectCount > 2) {
      await selectedChips.nth(1).getByRole('button').click();
      await expect(selectedChips).toHaveCount(selectCount - 1);
    }

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Parent-child hierarchy validation', async ({ page }) => {
    // Create parent and child collections
    const parentName = `Parent Collection ${timestamp}`;
    const parentSlug = `parent-${timestamp}`;
    const childName = `Child Collection ${timestamp}`;
    const childSlug = `child-${timestamp}`;

    // Create parent first
    await createTestCollection(page, parentName, parentSlug);

    // Create child with parent
    await page.getByRole('link', { name: 'Collections' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add Collection' }).click();
    await page.waitForTimeout(300);

    await page.getByLabel('Collection Name').fill(childName);
    await page.getByLabel('Slug').fill(childSlug);
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'SEASONAL' }).click();

    // Select parent
    const parentSelect = page.getByLabel('Parent Collection');
    if (await parentSelect.isVisible()) {
      await parentSelect.click();
      await page.getByRole('option', { name: parentName }).click();
    }

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page
        .locator('.mantine-Notification-body')
        .filter({ hasText: 'Collection created successfully' }),
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Verify child shows parent relationship
    const childRow = page.locator('tr').filter({ hasText: childName });
    await expect(childRow.getByText(parentName)).toBeVisible();

    // Verify parent cannot be set as its own parent
    const parentRow = page.locator('tr').filter({ hasText: parentName });
    await parentRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    const parentSelectInEdit = page.getByLabel('Parent Collection');
    if (await parentSelectInEdit.isVisible()) {
      await parentSelectInEdit.click();
      // Parent should not see itself as an option
      const selfOption = page.getByRole('option', { name: parentName });
      await expect(selfOption).not.toBeVisible();
      // Child should not be selectable as parent (circular dependency)
      const childOption = page.getByRole('option', { name: childName });
      await expect(childOption).not.toBeVisible();
      await page.keyboard.press('Escape');
    }

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Cross-entity search with relationships', async ({ page }) => {
    // Search for products that belong to specific collections
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    // Use search box
    const searchBox = page.getByPlaceholder('Search products...');
    await searchBox.fill('test');
    await page.waitForTimeout(500); // Debounce

    // Verify search results show relationship info
    const productRows = page.locator('tr').filter({ hasText: /test/i });
    const rowCount = await productRows.count();

    if (rowCount > 0) {
      // Check that relationship counts are visible
      const firstRow = productRows.first();
      const badges = firstRow.locator('.mantine-Badge');
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThan(0); // Should show status, type, and relationship counts
    }

    // Clear search
    await searchBox.clear();
    await page.waitForTimeout(500);
  });

  test('Bulk relationship assignment integrity', async ({ page }) => {
    // Create test entities
    const taxonomy1 = `Bulk Tax 1 ${timestamp}`;
    const taxonomy2 = `Bulk Tax 2 ${timestamp}`;
    const product1 = `Bulk Prod 1 ${timestamp}`;
    const product2 = `Bulk Prod 2 ${timestamp}`;

    await createTestTaxonomy(page, taxonomy1, `bulk-tax-1-${timestamp}`);
    await createTestTaxonomy(page, taxonomy2, `bulk-tax-2-${timestamp}`);
    await createTestProduct(page, product1, `BULK-1-${timestamp}`);
    await createTestProduct(page, product2, `BULK-2-${timestamp}`);

    // Go to taxonomies and select both for bulk assignment
    await page.getByRole('link', { name: 'Taxonomies' }).click();
    await page.waitForLoadState('networkidle');

    // Select checkboxes for our test taxonomies
    const tax1Row = page.locator('tr').filter({ hasText: taxonomy1 });
    const tax2Row = page.locator('tr').filter({ hasText: taxonomy2 });

    await tax1Row.locator('input[type="checkbox"]').check();
    await tax2Row.locator('input[type="checkbox"]').check();

    // Open bulk actions
    await page.getByRole('button', { name: 'Bulk Actions' }).click();
    await page.getByRole('menuitem', { name: 'Assign to Products' }).click();
    await page.waitForTimeout(500);

    // Select both products
    const productsSelect = page.getByLabel('Select Products');
    await productsSelect.click();
    await page.getByRole('option', { name: product1 }).click();
    await page.getByRole('option', { name: product2 }).click();
    await page.keyboard.press('Escape');

    // Apply
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.locator('.mantine-Notification-body').filter({ hasText: 'Successfully assigned' }),
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Verify both taxonomies now show 2 products each
    await expect(tax1Row.locator('.mantine-Badge').filter({ hasText: '2 products' })).toBeVisible();
    await expect(tax2Row.locator('.mantine-Badge').filter({ hasText: '2 products' })).toBeVisible();

    // Verify products show both taxonomies
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    const prod1Row = page.locator('tr').filter({ hasText: product1 });
    await prod1Row.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Should see both taxonomies
    const taxonomyChips = page.locator('.mantine-MultiSelect-value');
    const chipTexts = await taxonomyChips.allTextContents();
    expect(chipTexts.join(' ')).toContain(taxonomy1);
    expect(chipTexts.join(' ')).toContain(taxonomy2);

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Media association integrity across entities', async ({ page }) => {
    // Create a product and collection
    const productName = `Media Test Product ${timestamp}`;
    const collectionName = `Media Test Collection ${timestamp}`;

    await createTestProduct(page, productName, `MEDIA-PROD-${timestamp}`);
    await createTestCollection(page, collectionName, `media-coll-${timestamp}`);

    // Go to media page
    await page.getByRole('link', { name: 'Media' }).click();
    await page.waitForLoadState('networkidle');

    // Find first unassigned media
    const unassignedMedia = page.locator('[data-testid="media-card"]').first();
    const mediaCount = await unassignedMedia.count();

    if (mediaCount > 0) {
      // Edit to add associations
      await unassignedMedia.hover();
      await unassignedMedia.getByRole('button', { name: 'Edit' }).click();
      await page.waitForTimeout(500);

      // Go to associations tab
      await page.getByRole('tab', { name: 'Associations' }).click();

      // Associate with our test product
      await page.getByLabel('Associate with Product').click();
      await page.getByRole('option', { name: productName }).click();

      // Also associate with collection
      await page.getByLabel('Associate with Collection').click();
      await page.getByRole('option', { name: collectionName }).click();

      // Save
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page
          .locator('.mantine-Notification-body')
          .filter({ hasText: 'Media updated successfully' }),
      ).toBeVisible();
      await page.waitForTimeout(500);

      // Verify media shows both associations
      await expect(
        page.locator('.mantine-Badge').filter({ hasText: 'Product' }).first(),
      ).toBeVisible();
      await expect(
        page.locator('.mantine-Badge').filter({ hasText: 'Collection' }).first(),
      ).toBeVisible();

      // Now verify from product side
      await page.getByRole('link', { name: 'Products' }).click();
      await page.waitForLoadState('networkidle');

      const productRow = page.locator('tr').filter({ hasText: productName });
      await productRow.getByRole('button', { name: 'View' }).click();
      await page.waitForTimeout(500);

      // Should see media tab with count
      const mediaTab = page.getByRole('tab', { name: /Media/ });
      await expect(mediaTab).toBeVisible();
      // Tab should show count badge
      const mediaBadge = mediaTab.locator('.mantine-Badge');
      await expect(mediaBadge).toHaveText('1');
    }
  });
});
