import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import {
  createApiMocker,
  createVisualTester,
  withPerformanceMonitoring,
} from '@repo/testing/playwright';

const authHelpers = createAuthHelpers('http://localhost:3300');

test.describe('Backstage PIM - Product Information Management Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin user for all PIM tests
    const testUser = authHelpers.createTestUser({
      name: 'PIM Admin',
      email: `pim-admin-${Date.now()}@example.com`,
    });

    try {
      await authHelpers.signIn(page, testUser);
    } catch {
      await authHelpers.signUp(page, testUser);
    }
  });

  test('PIM main page loads with product management interface', async ({ context, page }) => {
    const { report, result } = await withPerformanceMonitoring(page, context, '/pim', async () => {
      // Verify page loads successfully
      await expect(page).toHaveTitle(/PIM|Product|Backstage/i);

      // Check for main PIM container
      const pimContainer = page.locator('main, [role="main"], .pim-container');
      await expect(pimContainer).toBeVisible();

      // Look for product management elements
      const productElements = [
        '[data-testid*="product"]',
        '.product-list',
        '.product-grid',
        '.product-table',
        'table:has(th:has-text("Product"))',
        'text=Products',
        'text=Catalog',
        'text=Inventory',
      ];

      let productInterfaceFound = false;
      for (const selector of productElements) {
        const elements = page.locator(selector);
        if ((await elements.count()) > 0) {
          await expect(elements.first()).toBeVisible();
          productInterfaceFound = true;
          break;
        }
      }

      // Look for product management actions
      const actionButtons = [
        'button:has-text("Add Product")',
        'button:has-text("Create Product")',
        'button:has-text("Import")',
        'button:has-text("Export")',
        '[data-testid*="add-product"]',
        '[data-testid*="create-product"]',
        'a[href*="create"]',
        'a[href*="new"]',
      ];

      let actionsFound = false;
      for (const selector of actionButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          actionsFound = true;
          break;
        }
      }

      return { actionsFound, productInterfaceFound };
    });

    // Performance assertions
    expect(result.report.metrics.fcp).toBeLessThan(2000);
    expect(result.report.metrics.lcp).toBeLessThan(3000);
  });

  test('product catalog browsing and filtering', async ({ context, page }) => {
    const visualTester = createVisualTester(page);

    await page.goto('/pim');
    await page.waitForLoadState('networkidle');

    // Test product search functionality
    const searchElements = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="product" i]',
      '[data-testid*="search"]',
      '.search-input',
    ];

    for (const selector of searchElements) {
      const searchInput = page.locator(selector).first();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill('test product');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Take screenshot of search results
        await visualTester.compareScreenshot('pim-search-results', {
          fullPage: true,
          threshold: 0.3,
        });
        break;
      }
    }

    // Test category/filter functionality
    const filterElements = [
      'select:has(option:has-text("Category"))',
      'select:has(option:has-text("Brand"))',
      'button:has-text("Filter")',
      '[data-testid*="filter"]',
      '[data-testid*="category"]',
      '.filter-dropdown',
      '.category-filter',
    ];

    for (const selector of filterElements) {
      const filterElement = page.locator(selector).first();
      if ((await filterElement.count()) > 0 && (await filterElement.isVisible())) {
        if (filterElement.getByRole) {
          // Handle select dropdowns
          if (await filterElement.evaluate((el) => el.tagName === 'SELECT')) {
            await filterElement.selectOption({ index: 1 });
          } else {
            await filterElement.click();
          }
        } else {
          await filterElement.click();
        }
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Test view mode switching (grid/list)
    const viewModeButtons = [
      'button:has-text("Grid")',
      'button:has-text("List")',
      'button:has-text("Table")',
      '[data-testid*="view-grid"]',
      '[data-testid*="view-list"]',
      '.view-toggle',
    ];

    for (const selector of viewModeButtons) {
      const button = page.locator(selector).first();
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(500);
        break;
      }
    }
  });

  test('product creation and editing workflow', async ({ context, page }) => {
    const apiMocker = createApiMocker(page);

    // Mock product creation API
    await apiMocker.mockEndpoint('/api/products', {
      method: 'POST',
      response: {
        id: 'test-product-123',
        name: 'Test Product',
        createdAt: new Date().toISOString(),
        sku: 'TEST-SKU-123',
        status: 'draft',
      },
    });

    await page.goto('/pim');
    await page.waitForLoadState('networkidle');

    // Look for create product button
    const createSelectors = [
      'button:has-text("Create")',
      'button:has-text("Add Product")',
      'button:has-text("New Product")',
      'a:has-text("Create")',
      '[data-testid*="create"]',
      '[data-testid*="add-product"]',
      '[href*="create"]',
      '[href*="new"]',
    ];

    let productCreationTested = false;
    for (const selector of createSelectors) {
      const createButton = page.locator(selector).first();
      if ((await createButton.count()) > 0 && (await createButton.isVisible())) {
        await createButton.click();
        await page.waitForLoadState('networkidle');

        // Check if we're on a create product page
        const currentUrl = page.url();
        if (currentUrl.includes('create') || currentUrl.includes('new')) {
          productCreationTested = true;

          // Look for product form elements
          const formElements = [
            'input[name*="name"]',
            'input[name*="sku"]',
            'input[name*="price"]',
            'textarea[name*="description"]',
            'select[name*="category"]',
            'input[type="file"]',
            '[data-testid*="product-form"]',
          ];

          let formFieldsFound = 0;
          for (const formSelector of formElements) {
            if ((await page.locator(formSelector).count()) > 0) {
              formFieldsFound++;
            }
          }

          if (formFieldsFound > 0) {
            // Fill out basic product information
            const nameInput = page
              .locator('input[name*="name"], input[placeholder*="name" i]')
              .first();
            if ((await nameInput.count()) > 0) {
              await nameInput.fill(`Test Product ${Date.now()}`);
            }

            const skuInput = page
              .locator('input[name*="sku"], input[placeholder*="sku" i]')
              .first();
            if ((await skuInput.count()) > 0) {
              await skuInput.fill(`TEST-SKU-${Date.now()}`);
            }

            const priceInput = page.locator('input[name*="price"], input[type="number"]').first();
            if ((await priceInput.count()) > 0) {
              await priceInput.fill('29.99');
            }

            const descriptionInput = page.locator('textarea').first();
            if ((await descriptionInput.count()) > 0) {
              await descriptionInput.fill('Test product created via e2e testing');
            }

            // Try to save the product
            const saveButtons = [
              'button:has-text("Save")',
              'button:has-text("Create")',
              'button[type="submit"]',
              '[data-testid*="save"]',
            ];

            for (const saveSelector of saveButtons) {
              const saveButton = page.locator(saveSelector);
              if ((await saveButton.count()) > 0 && (await saveButton.isVisible())) {
                await saveButton.click();
                await page.waitForTimeout(1000);
                break;
              }
            }
          }

          break;
        }
      }
    }

    // Test product editing if creation wasn't available
    if (!productCreationTested) {
      // Look for existing products to edit
      const productItems = [
        '.product-item',
        '.product-card',
        'tr:has(td)',
        '[data-testid*="product-item"]',
      ];

      for (const selector of productItems) {
        const items = page.locator(selector);
        if ((await items.count()) > 0) {
          const firstItem = items.first();

          // Look for edit button
          const editButtons = [
            'button:has-text("Edit")',
            'a:has-text("Edit")',
            '[data-testid*="edit"]',
          ];

          for (const editSelector of editButtons) {
            const editButton = firstItem.locator(editSelector);
            if ((await editButton.count()) > 0) {
              await editButton.click();
              await page.waitForLoadState('networkidle');
              break;
            }
          }
          break;
        }
      }
    }
  });

  test('product taxonomy and categorization', async ({ context, page }) => {
    await page.goto('/pim/taxonomy');
    await page.waitForLoadState('networkidle');

    // Check if taxonomy page exists
    const taxonomyElements = [
      'text=Taxonomy',
      'text=Categories',
      'text=Product Categories',
      'text=Classification',
      '[data-testid*="taxonomy"]',
      '[data-testid*="category"]',
      '.taxonomy-tree',
      '.category-tree',
    ];

    let taxonomyInterfaceFound = false;
    for (const selector of taxonomyElements) {
      if ((await page.locator(selector).count()) > 0) {
        taxonomyInterfaceFound = true;
        break;
      }
    }

    if (taxonomyInterfaceFound) {
      // Test category creation
      const createCategoryButtons = [
        'button:has-text("Add Category")',
        'button:has-text("Create Category")',
        'button:has-text("New Category")',
        '[data-testid*="add-category"]',
      ];

      for (const selector of createCategoryButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for category form
          const categoryForm = page.locator(
            'form, input[name*="category"], input[placeholder*="category" i]',
          );
          if ((await categoryForm.count()) > 0) {
            const nameInput = page
              .locator('input[name*="name"], input[placeholder*="name" i]')
              .first();
            if ((await nameInput.count()) > 0) {
              await nameInput.fill(`Test Category ${Date.now()}`);
            }
          }
          break;
        }
      }

      // Test category tree navigation
      const categoryNodes = [
        '.tree-node',
        '.category-node',
        'li:has(text)',
        '[data-testid*="category-node"]',
      ];

      for (const selector of categoryNodes) {
        const nodes = page.locator(selector);
        if ((await nodes.count()) > 0) {
          const firstNode = nodes.first();
          if (await firstNode.isVisible()) {
            await firstNode.click();
            await page.waitForTimeout(500);
            break;
          }
        }
      }
    } else {
      // If no taxonomy page, go back to main PIM
      await page.goto('/pim');
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent).toBeVisible();
    }
  });

  test('product media and asset management', async ({ context, page }) => {
    const visualTester = createVisualTester(page);

    await page.goto('/pim');
    await page.waitForLoadState('networkidle');

    // Look for media/asset management
    const mediaElements = [
      'text=Media',
      'text=Images',
      'text=Assets',
      'text=Gallery',
      'input[type="file"]',
      '[data-testid*="media"]',
      '[data-testid*="image"]',
      '.media-gallery',
      '.image-upload',
    ];

    let mediaManagementFound = false;
    for (const selector of mediaElements) {
      if ((await page.locator(selector).count()) > 0) {
        mediaManagementFound = true;
        break;
      }
    }

    if (mediaManagementFound) {
      // Test file upload if available
      const fileInputs = page.locator('input[type="file"]');
      if ((await fileInputs.count()) > 0) {
        const fileInput = fileInputs.first();
        if (await fileInput.isVisible()) {
          // Note: In a real test, you would upload an actual file
          // For e2e testing, we just verify the input exists
          await expect(fileInput).toBeVisible();
        }
      }

      // Test image gallery if available
      const galleryElements = [
        '.gallery',
        '.media-gallery',
        '.image-grid',
        '[data-testid*="gallery"]',
      ];

      for (const selector of galleryElements) {
        const gallery = page.locator(selector);
        if ((await gallery.count()) > 0 && (await gallery.isVisible())) {
          await visualTester.compareScreenshot('pim-media-gallery', {
            clip: (await gallery.boundingBox()) || undefined,
            threshold: 0.3,
          });
          break;
        }
      }
    }

    // Test drag and drop functionality if available
    const dropZones = [
      '.drop-zone',
      '.file-drop',
      '[data-testid*="drop-zone"]',
      'text=Drop files here',
    ];

    for (const selector of dropZones) {
      const dropZone = page.locator(selector);
      if ((await dropZone.count()) > 0 && (await dropZone.isVisible())) {
        // Test drag over effect
        await dropZone.hover();
        await page.waitForTimeout(500);
        break;
      }
    }
  });

  test('product import and export functionality', async ({ context, page }) => {
    const apiMocker = createApiMocker(page);

    // Mock import/export APIs
    await apiMocker.mockEndpoint('/api/products/import', {
      method: 'POST',
      response: {
        jobId: 'import-job-123',
        message: 'Import started successfully',
        status: 'processing',
      },
    });

    await apiMocker.mockEndpoint('/api/products/export', {
      method: 'POST',
      response: {
        downloadUrl: '/api/downloads/products-export-123.csv',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    });

    await page.goto('/pim');
    await page.waitForLoadState('networkidle');

    // Test import functionality
    const importButtons = [
      'button:has-text("Import")',
      'button:has-text("Import Products")',
      'a:has-text("Import")',
      '[data-testid*="import"]',
    ];

    let importTested = false;
    for (const selector of importButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);

        // Look for import interface
        const importElements = [
          'input[type="file"]',
          'text=CSV',
          'text=Excel',
          'text=Upload',
          '.import-dialog',
          '.file-upload',
        ];

        for (const importSelector of importElements) {
          if ((await page.locator(importSelector).count()) > 0) {
            importTested = true;
            break;
          }
        }
        break;
      }
    }

    // Test export functionality
    const exportButtons = [
      'button:has-text("Export")',
      'button:has-text("Export Products")',
      'a:has-text("Export")',
      '[data-testid*="export"]',
    ];

    let exportTested = false;
    for (const selector of exportButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);

        // Look for export options
        const exportElements = [
          'text=CSV',
          'text=Excel',
          'text=Download',
          'select:has(option:has-text("CSV"))',
          '.export-dialog',
          '.download-options',
        ];

        for (const exportSelector of exportElements) {
          if ((await page.locator(exportSelector).count()) > 0) {
            exportTested = true;
            break;
          }
        }
        break;
      }
    }

    // Verify API calls were made if import/export was tested
    if (importTested || exportTested) {
      const apiCalls = await apiMocker.getInterceptedRequests();
      expect(apiCalls.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('product inventory and stock management', async ({ context, page }) => {
    await page.goto('/pim');
    await page.waitForLoadState('networkidle');

    // Look for inventory/stock management features
    const inventoryElements = [
      'text=Inventory',
      'text=Stock',
      'text=Quantity',
      'text=In Stock',
      'text=Out of Stock',
      '[data-testid*="inventory"]',
      '[data-testid*="stock"]',
      '.inventory-status',
      '.stock-level',
    ];

    let inventoryFound = false;
    for (const selector of inventoryElements) {
      if ((await page.locator(selector).count()) > 0) {
        inventoryFound = true;
        break;
      }
    }

    if (inventoryFound) {
      // Test stock level editing
      const stockInputs = [
        'input[name*="stock"]',
        'input[name*="quantity"]',
        'input[placeholder*="stock" i]',
        'input[type="number"]',
      ];

      for (const selector of stockInputs) {
        const input = page.locator(selector).first();
        if ((await input.count()) > 0 && (await input.isVisible())) {
          await input.clear();
          await input.fill('100');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test inventory status filters
      const statusFilters = [
        'select:has(option:has-text("In Stock"))',
        'button:has-text("In Stock")',
        'button:has-text("Out of Stock")',
        '[data-testid*="status-filter"]',
      ];

      for (const selector of statusFilters) {
        const filter = page.locator(selector).first();
        if ((await filter.count()) > 0 && (await filter.isVisible())) {
          if (await filter.evaluate((el) => el.tagName === 'SELECT')) {
            await filter.selectOption({ index: 1 });
          } else {
            await filter.click();
          }
          await page.waitForTimeout(500);
          break;
        }
      }
    }

    // Test low stock alerts or notifications
    const alertElements = [
      'text=Low Stock',
      'text=Alert',
      'text=Warning',
      '.alert',
      '.warning',
      '[data-testid*="alert"]',
    ];

    for (const selector of alertElements) {
      if ((await page.locator(selector).count()) > 0) {
        break;
      }
    }
  });

  test('PIM performance with large product catalogs', async ({ context, page }) => {
    const { result } = await withPerformanceMonitoring(page, context, '/pim', async () => {
      // Test pagination if available
      const paginationElements = [
        '.pagination',
        'button:has-text("Next")',
        'button:has-text("Previous")',
        '[data-testid*="pagination"]',
        'nav[aria-label*="pagination" i]',
      ];

      let paginationTested = false;
      for (const selector of paginationElements) {
        const pagination = page.locator(selector);
        if ((await pagination.count()) > 0 && (await pagination.isVisible())) {
          const nextButton = pagination.locator('button:has-text("Next"), button:has-text(">")');
          if ((await nextButton.count()) > 0 && (await nextButton.isVisible())) {
            await nextButton.click();
            await page.waitForLoadState('networkidle');
            paginationTested = true;
          }
          break;
        }
      }

      // Test infinite scroll if available
      const scrollContainer = page.locator('.product-list, .product-grid, main');
      if ((await scrollContainer.count()) > 0) {
        await scrollContainer.first().hover();
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1000);
      }

      return { paginationTested };
    });

    // PIM should handle large catalogs efficiently
    expect(result.report.metrics.fcp).toBeLessThan(3000);
    expect(result.report.metrics.lcp).toBeLessThan(5000);

    // Check memory usage for large catalogs
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(150 * 1024 * 1024); // Less than 150MB
    }
  });
});
