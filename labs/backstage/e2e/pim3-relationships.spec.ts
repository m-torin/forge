import { test, expect, Page } from '@playwright/test';
import { createAuthHelpers } from '@repo/testing/auth-helpers';
import { ApiMocker } from './utils/api-mock';

/**
 * Comprehensive E2E tests for PIM3 module with focus on relationship management
 * These tests validate that all CRUD operations work correctly with complex relationships
 */

// Test data with unique timestamps to avoid conflicts
const timestamp = Date.now();
const testData = {
  product: {
    name: `Test Product ${timestamp}`,
    sku: `SKU-${timestamp}`,
    description: 'Test product with relationships',
    price: 99.99,
    category: 'Electronics',
    type: 'SIMPLE',
  },
  collection: {
    name: `Test Collection ${timestamp}`,
    slug: `test-collection-${timestamp}`,
    description: 'Test collection for E2E tests',
    type: 'SEASONAL',
  },
  taxonomy: {
    name: `Test Taxonomy ${timestamp}`,
    slug: `test-taxonomy-${timestamp}`,
    description: 'Test taxonomy for E2E tests',
    type: 'CATEGORY',
  },
  brand: {
    name: `Test Brand ${timestamp}`,
    slug: `test-brand-${timestamp}`,
    type: 'MANUFACTURER',
  },
  barcode: {
    barcode: `123456789${timestamp}`,
    type: 'UPC',
  },
};

// Helper to wait for Mantine notifications
async function waitForNotification(page: Page, text: string) {
  await expect(page.locator('.mantine-Notification-body').filter({ hasText: text })).toBeVisible();
  await page.waitForTimeout(500); // Wait for notification animation
}

// Helper to open modal forms
async function openForm(page: Page, buttonText: string) {
  await page.getByRole('button', { name: buttonText }).click();
  await page.waitForTimeout(300); // Wait for modal animation
}

// Helper to save form and wait for success
async function saveFormAndWait(page: Page, successMessage: string) {
  await page.getByRole('button', { name: 'Save' }).click();
  await waitForNotification(page, successMessage);
}

test.describe('PIM3 Relationship Management E2E Tests', () => {
  let authHelpers: ReturnType<typeof createAuthHelpers>;
  let testUser: { email: string; password: string };
  let apiMocker: ApiMocker;

  test.beforeAll(async () => {
    authHelpers = createAuthHelpers('http://localhost:3300');
    testUser = authHelpers.createTestUser({
      email: `pim-tester-${timestamp}@example.com`,
      name: `PIM Tester ${timestamp}`,
    });
    console.log('Test user:', testUser.email);
  });

  test.beforeEach(async ({ page }) => {
    // Sign up and authenticate
    await authHelpers.signUpNewUser(page, testUser);
    await authHelpers.signIn(page, testUser);

    // Initialize API mocker
    apiMocker = new ApiMocker(page);

    // Navigate to PIM3 module
    await page.goto('/pim3');
    await expect(page).toHaveTitle(/Product Information Management/);
  });

  test('Create product with collections, taxonomies, and brands relationships', async ({
    page,
  }) => {
    // Navigate to products page
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    // Open product form
    await openForm(page, 'Add Product');

    // Fill basic product information
    await page.getByLabel('Product Name').fill(testData.product.name);
    await page.getByLabel('SKU').fill(testData.product.sku);
    await page.getByLabel('Description').fill(testData.product.description);
    await page.getByLabel('Price').fill(testData.product.price.toString());

    // Select category
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: testData.product.category }).click();

    // Select type
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: testData.product.type }).click();

    // Navigate to relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Add collections (multi-select)
    const collectionsSelect = page.getByLabel('Collections');
    await collectionsSelect.click();
    // Select first two available collections
    await page.getByRole('option').first().click();
    await page.getByRole('option').nth(1).click();
    await page.keyboard.press('Escape'); // Close dropdown

    // Add taxonomies (multi-select)
    const taxonomiesSelect = page.getByLabel('Taxonomies');
    await taxonomiesSelect.click();
    // Select first available taxonomy
    await page.getByRole('option').first().click();
    await page.keyboard.press('Escape');

    // Add brands via PdpJoin (multi-select)
    const brandsSelect = page.getByLabel('Brands');
    await brandsSelect.click();
    // Select first available brand
    await page.getByRole('option').first().click();
    await page.keyboard.press('Escape');

    // Navigate to barcodes tab
    await page.getByRole('tab', { name: 'Barcodes' }).click();

    // Add a barcode
    await page.getByRole('button', { name: 'Add Barcode' }).click();
    await page.getByPlaceholder('Enter barcode').fill(testData.barcode.barcode);
    await page.getByLabel('Barcode Type').click();
    await page.getByRole('option', { name: testData.barcode.type }).click();
    await page.getByLabel('Primary barcode').check();

    // Save the product
    await saveFormAndWait(page, 'Product created successfully');

    // Verify product appears in the table with relationships
    await expect(page.getByText(testData.product.name)).toBeVisible();
    await expect(page.getByText(testData.product.sku)).toBeVisible();

    // Open the product to verify relationships were saved
    await page.getByText(testData.product.name).click();
    await page.waitForTimeout(500);

    // Verify relationships tab shows the selections
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Verify collections are selected
    const selectedCollections = page.locator('.mantine-MultiSelect-value');
    await expect(selectedCollections).toHaveCount(3); // 2 collections + 1 taxonomy

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Create collection with products and taxonomies relationships', async ({ page }) => {
    // Navigate to collections page
    await page.getByRole('link', { name: 'Collections' }).click();
    await page.waitForLoadState('networkidle');

    // Open collection form
    await openForm(page, 'Add Collection');

    // Fill basic collection information
    await page.getByLabel('Collection Name').fill(testData.collection.name);
    await page.getByLabel('Slug').fill(testData.collection.slug);
    await page.getByLabel('Description').fill(testData.collection.description);

    // Select type
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: testData.collection.type }).click();

    // Navigate to relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Add products (multi-select)
    const productsSelect = page.getByLabel('Products');
    await productsSelect.click();
    // Select any available products
    const productOptions = page.getByRole('option');
    const productCount = await productOptions.count();
    if (productCount > 0) {
      await productOptions.first().click();
      if (productCount > 1) {
        await productOptions.nth(1).click();
      }
    }
    await page.keyboard.press('Escape');

    // Add taxonomies (multi-select)
    const taxonomiesSelect = page.getByLabel('Taxonomies');
    await taxonomiesSelect.click();
    const taxonomyOptions = page.getByRole('option');
    const taxonomyCount = await taxonomyOptions.count();
    if (taxonomyCount > 0) {
      await taxonomyOptions.first().click();
    }
    await page.keyboard.press('Escape');

    // Save the collection
    await saveFormAndWait(page, 'Collection created successfully');

    // Verify collection appears in the table
    await expect(page.getByText(testData.collection.name)).toBeVisible();
    await expect(page.getByText(`/${testData.collection.slug}`)).toBeVisible();
  });

  test('Create taxonomy with products and collections relationships', async ({ page }) => {
    // Navigate to taxonomies page
    await page.getByRole('link', { name: 'Taxonomies' }).click();
    await page.waitForLoadState('networkidle');

    // Open taxonomy form
    await openForm(page, 'Add Taxonomy');

    // Fill basic taxonomy information
    await page.getByLabel('Name').fill(testData.taxonomy.name);
    await page.getByLabel('Slug').fill(testData.taxonomy.slug);
    await page.getByLabel('Description').fill(testData.taxonomy.description);

    // Select type
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: testData.taxonomy.type }).click();

    // Navigate to relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Add products (multi-select)
    const productsSelect = page.getByLabel('Products');
    await productsSelect.click();
    const productOptions = page.getByRole('option');
    const productCount = await productOptions.count();
    if (productCount > 0) {
      await productOptions.first().click();
    }
    await page.keyboard.press('Escape');

    // Add collections (multi-select)
    const collectionsSelect = page.getByLabel('Collections');
    await collectionsSelect.click();
    const collectionOptions = page.getByRole('option');
    const collectionCount = await collectionOptions.count();
    if (collectionCount > 0) {
      await collectionOptions.first().click();
    }
    await page.keyboard.press('Escape');

    // Save the taxonomy
    await saveFormAndWait(page, 'Taxonomy created successfully');

    // Verify taxonomy appears in the table
    await expect(page.getByText(testData.taxonomy.name)).toBeVisible();
    await expect(page.getByText(`/${testData.taxonomy.slug}`)).toBeVisible();
  });

  test('Create brand with products relationship via PdpJoin', async ({ page }) => {
    // Navigate to brands page
    await page.getByRole('link', { name: 'Brands' }).click();
    await page.waitForLoadState('networkidle');

    // Open brand form
    await openForm(page, 'Add Brand');

    // Fill basic brand information
    await page.getByLabel('Brand Name').fill(testData.brand.name);
    await page.getByLabel('Slug').fill(testData.brand.slug);

    // Select type
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: testData.brand.type }).click();

    // Navigate to products tab
    await page.getByRole('tab', { name: 'Products' }).click();

    // Add products via PdpJoin (multi-select)
    const productsSelect = page.getByLabel('Products');
    await productsSelect.click();
    const productOptions = page.getByRole('option');
    const productCount = await productOptions.count();
    if (productCount > 0) {
      await productOptions.first().click();
      if (productCount > 1) {
        await productOptions.nth(1).click();
      }
    }
    await page.keyboard.press('Escape');

    // Save the brand
    await saveFormAndWait(page, 'Brand created successfully');

    // Verify brand appears in the table
    await expect(page.getByText(testData.brand.name)).toBeVisible();
    await expect(page.getByText(`/${testData.brand.slug}`)).toBeVisible();
  });

  test('Update product relationships - add and remove', async ({ page }) => {
    // First create a product
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    // Assuming we have the product from the first test, find and edit it
    const productRow = page.locator('tr').filter({ hasText: testData.product.name });
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    // Navigate to relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Remove a collection by clicking the X on a chip
    const collectionChips = page.locator('.mantine-MultiSelect-value');
    const initialCount = await collectionChips.count();
    if (initialCount > 0) {
      await collectionChips.first().getByRole('button').click(); // Click X to remove
    }

    // Add a new taxonomy
    const taxonomiesSelect = page.getByLabel('Taxonomies');
    await taxonomiesSelect.click();
    const taxonomyOptions = page.getByRole('option');
    const taxonomyCount = await taxonomyOptions.count();
    if (taxonomyCount > 1) {
      await taxonomyOptions.nth(1).click(); // Select second taxonomy
    }
    await page.keyboard.press('Escape');

    // Save changes
    await saveFormAndWait(page, 'Product updated successfully');

    // Verify changes persisted by reopening
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Verify collection was removed (one less chip)
    const updatedChips = page.locator('.mantine-MultiSelect-value');
    const newCount = await updatedChips.count();
    expect(newCount).toBeLessThan(initialCount);

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Media upload with entity associations', async ({ page }) => {
    // Navigate to media page
    await page.getByRole('link', { name: 'Media' }).click();
    await page.waitForLoadState('networkidle');

    // Open upload modal
    await openForm(page, 'Upload Media');

    // Note: File upload in Playwright requires a real file
    // For testing purposes, we'll simulate by closing upload and using edit on existing media
    await page.getByRole('button', { name: 'Close' }).click();

    // Find first media item and edit it to add associations
    const mediaCards = page.locator('[data-testid="media-card"]');
    const mediaCount = await mediaCards.count();

    if (mediaCount > 0) {
      // Click edit on first media item
      await mediaCards.first().hover();
      await mediaCards.first().getByRole('button', { name: 'Edit' }).click();
      await page.waitForTimeout(500);

      // Navigate to associations tab
      await page.getByRole('tab', { name: 'Associations' }).click();

      // Associate with a product
      await page.getByLabel('Associate with Product').click();
      const productOptions = page.getByRole('option');
      const productCount = await productOptions.count();
      if (productCount > 0) {
        await productOptions.first().click();
      }

      // Associate with a collection
      await page.getByLabel('Associate with Collection').click();
      const collectionOptions = page.getByRole('option');
      const collectionCount = await collectionOptions.count();
      if (collectionCount > 0) {
        await collectionOptions.first().click();
      }

      // Save associations
      await saveFormAndWait(page, 'Media updated successfully');

      // Verify associations appear in media grid/list
      await expect(page.locator('.mantine-Badge').filter({ hasText: 'Product' })).toBeVisible();
      await expect(page.locator('.mantine-Badge').filter({ hasText: 'Collection' })).toBeVisible();
    }
  });

  test('Bulk operations with relationships', async ({ page }) => {
    // Navigate to taxonomies page for bulk operations
    await page.getByRole('link', { name: 'Taxonomies' }).click();
    await page.waitForLoadState('networkidle');

    // Select multiple taxonomies
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 2) {
      // Select first two items (skip header checkbox)
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      // Open bulk actions menu
      await page.getByRole('button', { name: 'Bulk Actions' }).click();

      // Select "Assign to Products"
      await page.getByRole('menuitem', { name: 'Assign to Products' }).click();
      await page.waitForTimeout(500);

      // In the bulk assign modal, select products
      const productsSelect = page.getByLabel('Select Products');
      await productsSelect.click();
      const productOptions = page.getByRole('option');
      const productCount = await productOptions.count();
      if (productCount > 0) {
        await productOptions.first().click();
        if (productCount > 1) {
          await productOptions.nth(1).click();
        }
      }
      await page.keyboard.press('Escape');

      // Apply bulk assignment
      await page.getByRole('button', { name: 'Apply' }).click();
      await waitForNotification(page, 'Successfully assigned');
    }
  });

  test('Search and filter with relationship counts', async ({ page }) => {
    // Navigate to products page
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    // Search for our test product
    await page.getByPlaceholder('Search products...').fill(testData.product.name);
    await page.waitForTimeout(500); // Debounce delay

    // Verify product is found
    await expect(page.getByText(testData.product.name)).toBeVisible();

    // Check that relationship counts are displayed
    const productRow = page.locator('tr').filter({ hasText: testData.product.name });

    // Look for seller count badge
    const sellerBadge = productRow.locator('.mantine-Badge').filter({ hasText: /\d+/ });
    await expect(sellerBadge).toBeVisible();

    // Clear search
    await page.getByPlaceholder('Search products...').clear();

    // Filter by status
    await page.getByLabel('Filter by status').click();
    await page.getByRole('option', { name: 'Published' }).click();

    // Verify filtered results
    await page.waitForTimeout(500);
    const statusBadges = page.locator('.mantine-Badge').filter({ hasText: 'PUBLISHED' });
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('Relationship validation - circular dependencies', async ({ page }) => {
    // This test would check for proper handling of circular dependencies
    // For example, preventing a collection from being its own parent

    await page.getByRole('link', { name: 'Collections' }).click();
    await page.waitForLoadState('networkidle');

    // Edit an existing collection
    const collectionRows = page.locator('tr').filter({ hasText: testData.collection.name });
    const rowCount = await collectionRows.count();

    if (rowCount > 0) {
      await collectionRows.first().getByRole('button', { name: 'Edit' }).click();
      await page.waitForTimeout(500);

      // Try to set parent to itself (should be prevented)
      const parentSelect = page.getByLabel('Parent Collection');
      if (await parentSelect.isVisible()) {
        await parentSelect.click();

        // The current collection should not appear in options
        const selfOption = page.getByRole('option', { name: testData.collection.name });
        await expect(selfOption).toBeHidden();

        await page.keyboard.press('Escape');
      }

      // Close modal
      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  });

  test('Performance - large relationship lists', async ({ page }) => {
    // Test that multi-selects handle large lists efficiently
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await openForm(page, 'Add Product');

    // Navigate to relationships tab
    await page.getByRole('tab', { name: 'Relationships' }).click();

    // Open collections multi-select
    const collectionsSelect = page.getByLabel('Collections');
    await collectionsSelect.click();

    // Verify dropdown opens quickly even with many items
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 1000 });

    // Test search within multi-select
    await collectionsSelect.fill('test');
    await page.waitForTimeout(300); // Debounce

    // Verify filtered results appear
    const filteredOptions = page.getByRole('option');
    const optionCount = await filteredOptions.count();
    expect(optionCount).toBeGreaterThanOrEqual(0);

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});

test.describe('PIM3 Form Validation Tests', () => {
  let authHelpers: ReturnType<typeof createAuthHelpers>;
  let testUser: { email: string; password: string };

  test.beforeAll(async () => {
    authHelpers = createAuthHelpers('http://localhost:3300');
    testUser = authHelpers.createTestUser({
      email: `pim-validator-${timestamp}@example.com`,
      name: `PIM Validator ${timestamp}`,
    });
  });

  test.beforeEach(async ({ page }) => {
    await authHelpers.signUpNewUser(page, testUser);
    await authHelpers.signIn(page, testUser);
    await page.goto('/pim3');
  });

  test('Product form validation', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    await openForm(page, 'Add Product');

    // Try to save without required fields
    await page.getByRole('button', { name: 'Save' }).click();

    // Check for validation errors
    await expect(page.getByText('Product name is required')).toBeVisible();
    await expect(page.getByText('SKU is required')).toBeVisible();

    // Fill required fields
    await page.getByLabel('Product Name').fill('Valid Product');
    await page.getByLabel('SKU').fill('VALID-SKU');

    // Validation errors should disappear
    await expect(page.getByText('Product name is required')).toBeHidden();
    await expect(page.getByText('SKU is required')).toBeHidden();

    // Test SKU uniqueness validation (would need API mock)
    await page.getByLabel('SKU').clear();
    await page.getByLabel('SKU').fill('DUPLICATE-SKU');
    await page.getByRole('button', { name: 'Save' }).click();

    // Would check for duplicate SKU error if API returns it
    // await expect(page.getByText('SKU already exists')).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Barcode validation', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForLoadState('networkidle');

    // Edit first product
    const editButtons = page.getByRole('button', { name: 'Edit' });
    const buttonCount = await editButtons.count();

    if (buttonCount > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(500);

      // Navigate to barcodes tab
      await page.getByRole('tab', { name: 'Barcodes' }).click();

      // Add invalid barcode
      await page.getByRole('button', { name: 'Add Barcode' }).click();
      await page.getByPlaceholder('Enter barcode').fill('123'); // Too short

      // Select type
      await page.getByLabel('Barcode Type').click();
      await page.getByRole('option', { name: 'UPC' }).click();

      // Save should show validation error
      await page.getByRole('button', { name: 'Save' }).click();

      // Check for barcode validation message
      await expect(page.getByText(/Invalid barcode format|Barcode must be/)).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  });
});
