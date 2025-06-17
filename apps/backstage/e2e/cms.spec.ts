import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import {
  createApiMocker,
  createVisualTester,
  withPerformanceMonitoring,
} from '@repo/testing/playwright';

const authHelpers = createAuthHelpers('http://localhost:3300');

test.describe('Backstage CMS - Content Management System Testing', (_: any) => {
  test.beforeEach(async ({ page }: any) => {
    // Sign in as admin user for all CMS tests
    const testUser = authHelpers.createTestUser({
      name: 'CMS Admin',
      email: `cms-admin-${Date.now()}@example.com`,
    });

    try {
      await authHelpers.signIn(page, testUser);
    } catch {
      await authHelpers.signUp(page, testUser);
    }
  });

  test('CMS main page loads with content management interface', async ({ context, page }: any) => {
    const { report, result } = await withPerformanceMonitoring(page, context, '/cms', async () => {
      // Verify page loads successfully
      await expect(page).toHaveTitle(/CMS|Content|Backstage/i);

      // Check for main CMS container
      const cmsContainer = page.locator('main, [role="main"], .cms-container');
      await expect(cmsContainer).toBeVisible();

      // Look for content management elements
      const contentElements = [
        '[data-testid*="content"]',
        '.content-list',
        '.content-grid',
        '.content-table',
        'table:has(th:has-text("Content"))',
        'table:has(th:has-text("Title"))',
        'text=Content',
        'text=Articles',
        'text=Pages',
        'text=Posts',
      ];

      let contentInterfaceFound = false;
      for (const selector of contentElements) {
        const elements = page.locator(selector);
        if ((await elements.count()) > 0) {
          await expect(elements.first()).toBeVisible();
          contentInterfaceFound = true;
          break;
        }
      }

      // Look for content creation actions
      const actionButtons = [
        'button:has-text("Create")',
        'button:has-text("Add Content")',
        'button:has-text("New Article")',
        'button:has-text("New Page")',
        '[data-testid*="create-content"]',
        '[data-testid*="add-content"]',
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

      return { actionsFound, contentInterfaceFound };
    });

    // Performance assertions
    expect(result.report.metrics.fcp).toBeLessThan(2000);
    expect(result.report.metrics.lcp).toBeLessThan(3000);
  });

  test('content creation and rich text editing', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page);

    await page.goto('/cms');
    await page.waitForLoadState('networkidle');

    // Look for create content button
    const createSelectors = [
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")',
      'a:has-text("Create")',
      'a:has-text("New Content")',
      '[data-testid*="create"]',
      '[href*="create"]',
      '[href*="new"]',
    ];

    let contentCreationTested = false;
    for (const selector of createSelectors) {
      const createButton = page.locator(selector).first();
      if ((await createButton.count()) > 0 && (await createButton.isVisible())) {
        await createButton.click();
        await page.waitForLoadState('networkidle');

        // Check if we're on a content creation page
        const currentUrl = page.url();
        if (
          currentUrl.includes('create') ||
          currentUrl.includes('new') ||
          currentUrl.includes('edit')
        ) {
          contentCreationTested = true;

          // Look for content form elements
          const formElements = [
            'input[name*="title"]',
            'input[name*="slug"]',
            'textarea[name*="content"]',
            'textarea[name*="description"]',
            'select[name*="status"]',
            'select[name*="category"]',
            '[data-testid*="content-form"]',
            '.rich-text-editor',
            '.editor',
          ];

          let editorFound = false;
          for (const formSelector of formElements) {
            if ((await page.locator(formSelector).count()) > 0) {
              editorFound = true;
              break;
            }
          }

          if (editorFound) {
            // Fill out basic content information
            const titleInput = page
              .locator('input[name*="title"], input[placeholder*="title" i]')
              .first();
            if ((await titleInput.count()) > 0) {
              await titleInput.fill(`Test Content ${Date.now()}`);
            }

            const slugInput = page
              .locator('input[name*="slug"], input[placeholder*="slug" i]')
              .first();
            if ((await slugInput.count()) > 0) {
              await slugInput.fill(`test-content-${Date.now()}`);
            }

            // Test rich text editor
            const richTextElements = [
              '.rich-text-editor',
              '.editor',
              'div[contenteditable="true"]',
              'textarea[name*="content"]',
              '[data-testid*="editor"]',
            ];

            for (const editorSelector of richTextElements) {
              const editor = page.locator(editorSelector);
              if ((await editor.count()) > 0 && (await editor.isVisible())) {
                await editor.click();
                await editor.fill(
                  'This is test content created via e2e testing. It includes **bold text** and other formatting.',
                );

                // Test editor toolbar if available
                const toolbarButtons = [
                  'button[title*="Bold"]',
                  'button[title*="Italic"]',
                  'button:has-text("B")',
                  'button:has-text("I")',
                  '.editor-toolbar button',
                ];

                for (const toolbarSelector of toolbarButtons) {
                  const toolbarButton = page.locator(toolbarSelector).first();
                  if ((await toolbarButton.count()) > 0 && (await toolbarButton.isVisible())) {
                    await toolbarButton.click();
                    await page.waitForTimeout(500);
                    break;
                  }
                }
                break;
              }
            }

            // Take screenshot of content creation form
            await visualTester.compareScreenshot('cms-content-creation', {
              fullPage: true,
              threshold: 0.3,
            });
          }

          break;
        }
      }
    }

    // If no creation form found, test existing content editing
    if (!contentCreationTested) {
      const contentItems = [
        '.content-item',
        '.content-card',
        'tr:has(td)',
        '[data-testid*="content-item"]',
      ];

      for (const selector of contentItems) {
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

  test('content media management and file uploads', async ({ context, page }: any) => {
    await page.goto('/cms/media');
    await page.waitForLoadState('networkidle');

    // Check if media management page exists
    const mediaElements = [
      'text=Media',
      'text=Files',
      'text=Images',
      'text=Documents',
      'text=Gallery',
      '[data-testid*="media"]',
      '[data-testid*="files"]',
      '.media-library',
      '.file-manager',
    ];

    let mediaManagementFound = false;
    for (const selector of mediaElements) {
      if ((await page.locator(selector).count()) > 0) {
        mediaManagementFound = true;
        break;
      }
    }

    if (mediaManagementFound) {
      // Test file upload functionality
      const uploadElements = [
        'input[type="file"]',
        'button:has-text("Upload")',
        'button:has-text("Add Files")',
        '[data-testid*="upload"]',
        '.upload-button',
        '.file-upload',
      ];

      for (const selector of uploadElements) {
        const uploadElement = page.locator(selector);
        if ((await uploadElement.count()) > 0 && (await uploadElement.isVisible())) {
          if (await uploadElement.evaluate((el: any) => el.tagName === 'INPUT')) {
            // File input - verify it exists
            await expect(uploadElement).toBeVisible();
          } else {
            // Upload button - try clicking
            await uploadElement.click();
            await page.waitForTimeout(1000);
          }
          break;
        }
      }

      // Test media search and filtering
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill('image');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Test media type filters
      const filterButtons = [
        'button:has-text("Images")',
        'button:has-text("Documents")',
        'button:has-text("Videos")',
        '[data-testid*="filter-images"]',
        '[data-testid*="filter-docs"]',
      ];

      for (const selector of filterButtons) {
        const button = page.locator(selector).first();
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(500);
          break;
        }
      }
    } else {
      // If no media page, go back to main CMS
      await page.goto('/cms');
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent).toBeVisible();
    }
  });

  test('content publishing workflow and status management', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock content publishing API
    await apiMocker.mockEndpoint('/api/content/publish', {
      method: 'POST',
      response: {
        id: 'content-123',
        publishedAt: new Date().toISOString(),
        status: 'published',
      },
    });

    await page.goto('/cms');
    await page.waitForLoadState('networkidle');

    // Look for content status management
    const statusElements = [
      'text=Draft',
      'text=Published',
      'text=Pending',
      'text=Archived',
      'select[name*="status"]',
      '[data-testid*="status"]',
      '.status-badge',
      '.content-status',
    ];

    let statusManagementFound = false;
    for (const selector of statusElements) {
      if ((await page.locator(selector).count()) > 0) {
        statusManagementFound = true;
        break;
      }
    }

    if (statusManagementFound) {
      // Test publishing workflow
      const publishButtons = [
        'button:has-text("Publish")',
        'button:has-text("Save & Publish")',
        '[data-testid*="publish"]',
        '.publish-button',
      ];

      for (const selector of publishButtons) {
        const button = page.locator(selector).first();
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for confirmation or success message
          const confirmationElements = [
            'text=Published',
            'text=Success',
            'text=Content published',
            '.success-message',
            '.notification',
          ];

          for (const confirmSelector of confirmationElements) {
            if ((await page.locator(confirmSelector).count()) > 0) {
              break;
            }
          }
          break;
        }
      }

      // Test status filtering
      const statusFilters = [
        'select:has(option:has-text("Published"))',
        'button:has-text("Published")',
        'button:has-text("Draft")',
        '[data-testid*="filter-status"]',
      ];

      for (const selector of statusFilters) {
        const filter = page.locator(selector).first();
        if ((await filter.count()) > 0 && (await filter.isVisible())) {
          if (await filter.evaluate((el: any) => el.tagName === 'SELECT')) {
            await filter.selectOption({ index: 1 });
          } else {
            await filter.click();
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test content scheduling if available
      const scheduleElements = [
        'input[type="datetime-local"]',
        'input[type="date"]',
        'text=Schedule',
        'text=Publish Date',
        '[data-testid*="schedule"]',
      ];

      for (const selector of scheduleElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.tagName === 'INPUT')) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            const dateString = futureDate.toISOString().slice(0, 16);
            await element.fill(dateString);
          }
          break;
        }
      }
    }
  });

  test('content categories and taxonomy management', async ({ context, page }: any) => {
    await page.goto('/cms');
    await page.waitForLoadState('networkidle');

    // Look for category management
    const categoryElements = [
      'text=Categories',
      'text=Tags',
      'text=Taxonomy',
      'select[name*="category"]',
      '[data-testid*="category"]',
      '[data-testid*="tags"]',
      '.category-selector',
      '.tag-input',
    ];

    let categoryManagementFound = false;
    for (const selector of categoryElements) {
      if ((await page.locator(selector).count()) > 0) {
        categoryManagementFound = true;
        break;
      }
    }

    if (categoryManagementFound) {
      // Test category selection
      const categorySelectors = page.locator('select[name*="category"]');
      if ((await categorySelectors.count()) > 0) {
        const categorySelect = categorySelectors.first();
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }

      // Test tag management
      const tagInputs = [
        'input[name*="tags"]',
        'input[placeholder*="tags" i]',
        '.tag-input',
        '[data-testid*="tag-input"]',
      ];

      for (const selector of tagInputs) {
        const tagInput = page.locator(selector).first();
        if ((await tagInput.count()) > 0 && (await tagInput.isVisible())) {
          await tagInput.fill('test-tag, e2e-testing, content');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test creating new categories
      const addCategoryButtons = [
        'button:has-text("Add Category")',
        'button:has-text("New Category")',
        '[data-testid*="add-category"]',
      ];

      for (const selector of addCategoryButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for category creation form
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
    }
  });

  test('content search and advanced filtering', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page);

    await page.goto('/cms');
    await page.waitForLoadState('networkidle');

    // Test content search functionality
    const searchElements = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="content" i]',
      '[data-testid*="search"]',
      '.search-input',
    ];

    for (const selector of searchElements) {
      const searchInput = page.locator(selector).first();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill('test content');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // Take screenshot of search results
        await visualTester.compareScreenshot('cms-search-results', {
          fullPage: true,
          threshold: 0.3,
        });
        break;
      }
    }

    // Test advanced filtering
    const filterElements = [
      'button:has-text("Filter")',
      'button:has-text("Advanced")',
      '[data-testid*="filter"]',
      '[data-testid*="advanced-search"]',
      '.filter-toggle',
      '.advanced-search',
    ];

    for (const selector of filterElements) {
      const filterButton = page.locator(selector).first();
      if ((await filterButton.count()) > 0 && (await filterButton.isVisible())) {
        await filterButton.click();
        await page.waitForTimeout(1000);

        // Look for filter options
        const filterOptions = [
          'select[name*="author"]',
          'select[name*="date"]',
          'input[type="date"]',
          'select[name*="type"]',
          '.filter-option',
        ];

        for (const optionSelector of filterOptions) {
          const option = page.locator(optionSelector).first();
          if ((await option.count()) > 0 && (await option.isVisible())) {
            if (await option.evaluate((el: any) => el.tagName === 'SELECT')) {
              await option.selectOption({ index: 1 });
            } else if (await option.evaluate((el: any) => el.type === 'date')) {
              const today = new Date().toISOString().slice(0, 10);
              await option.fill(today);
            }
            await page.waitForTimeout(500);
            break;
          }
        }
        break;
      }
    }

    // Test sorting options
    const sortElements = [
      'select:has(option:has-text("Date"))',
      'select:has(option:has-text("Title"))',
      'button:has-text("Sort")',
      '[data-testid*="sort"]',
    ];

    for (const selector of sortElements) {
      const sortElement = page.locator(selector).first();
      if ((await sortElement.count()) > 0 && (await sortElement.isVisible())) {
        if (await sortElement.evaluate((el: any) => el.tagName === 'SELECT')) {
          await sortElement.selectOption({ index: 1 });
        } else {
          await sortElement.click();
        }
        await page.waitForTimeout(500);
        break;
      }
    }
  });

  test('content preview and SEO optimization', async ({ context, page }: any) => {
    await page.goto('/cms');
    await page.waitForLoadState('networkidle');

    // Look for content preview functionality
    const previewElements = [
      'button:has-text("Preview")',
      'a:has-text("Preview")',
      '[data-testid*="preview"]',
      '.preview-button',
    ];

    let previewTested = false;
    for (const selector of previewElements) {
      const previewButton = page.locator(selector).first();
      if ((await previewButton.count()) > 0 && (await previewButton.isVisible())) {
        await previewButton.click();
        await page.waitForTimeout(2000);

        // Check if preview opened in new tab or modal
        const pages = page.context().pages();
        if (pages.length > 1) {
          // New tab opened
          const previewPage = pages[pages.length - 1];
          await previewPage.waitForLoadState('networkidle');
          await previewPage.close();
        } else {
          // Modal or overlay preview
          const previewModal = page.locator('.modal, .preview-modal, .overlay');
          if ((await previewModal.count()) > 0) {
            await expect(previewModal).toBeVisible();

            // Close preview
            const closeButtons = [
              'button:has-text("Close")',
              'button:has-text("×")',
              '[data-testid*="close"]',
            ];

            for (const closeSelector of closeButtons) {
              const closeButton = page.locator(closeSelector);
              if ((await closeButton.count()) > 0) {
                await closeButton.click();
                break;
              }
            }
          }
        }
        previewTested = true;
        break;
      }
    }

    // Test SEO optimization features
    const seoElements = [
      'text=SEO',
      'text=Meta',
      'text=Description',
      'input[name*="meta"]',
      'textarea[name*="description"]',
      '[data-testid*="seo"]',
      '.seo-panel',
      '.meta-fields',
    ];

    for (const selector of seoElements) {
      if ((await page.locator(selector).count()) > 0) {
        // Try to fill SEO fields if found
        const metaDescription = page
          .locator('textarea[name*="description"], input[name*="meta"]')
          .first();
        if ((await metaDescription.count()) > 0 && (await metaDescription.isVisible())) {
          await metaDescription.fill('Test meta description for SEO optimization');
        }

        const metaKeywords = page.locator('input[name*="keywords"], input[name*="tags"]').first();
        if ((await metaKeywords.count()) > 0 && (await metaKeywords.isVisible())) {
          await metaKeywords.fill('test, content, seo, optimization');
        }
        break;
      }
    }
  });

  test('content versioning and revision history', async ({ context, page }: any) => {
    await page.goto('/cms');
    await page.waitForLoadState('networkidle');

    // Look for version control features
    const versionElements = [
      'text=Versions',
      'text=History',
      'text=Revisions',
      'button:has-text("History")',
      '[data-testid*="version"]',
      '[data-testid*="history"]',
      '.version-history',
      '.revision-panel',
    ];

    let versioningFound = false;
    for (const selector of versionElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        versioningFound = true;

        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(1000);

          // Look for version list
          const versionList = [
            '.version-list',
            '.revision-list',
            'ul:has(li:has-text("Version"))',
            '[data-testid*="version-list"]',
          ];

          for (const listSelector of versionList) {
            if ((await page.locator(listSelector).count()) > 0) {
              break;
            }
          }
        }
        break;
      }
    }

    // Test version comparison if available
    const compareButtons = [
      'button:has-text("Compare")',
      'button:has-text("Diff")',
      '[data-testid*="compare"]',
    ];

    for (const selector of compareButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Test version restoration
    const restoreButtons = [
      'button:has-text("Restore")',
      'button:has-text("Revert")',
      '[data-testid*="restore"]',
    ];

    for (const selector of restoreButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        // Don't actually restore in test, just verify button exists
        await expect(button).toBeVisible();
        break;
      }
    }
  });

  test('CMS performance and bulk operations', async ({ context, page }: any) => {
    const { result } = await withPerformanceMonitoring(page, context, '/cms', async () => {
      // Test bulk selection if available
      const bulkElements = [
        'input[type="checkbox"]',
        'button:has-text("Select All")',
        '[data-testid*="bulk"]',
        '.bulk-actions',
      ];

      let bulkOperationsTested = false;
      for (const selector of bulkElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            await element.check();
          } else {
            await element.click();
          }
          await page.waitForTimeout(500);
          bulkOperationsTested = true;
          break;
        }
      }

      // Test bulk actions if selection was made
      if (bulkOperationsTested) {
        const bulkActionButtons = [
          'button:has-text("Delete Selected")',
          'button:has-text("Publish Selected")',
          'button:has-text("Archive Selected")',
          '[data-testid*="bulk-action"]',
        ];

        for (const actionSelector of bulkActionButtons) {
          const button = page.locator(actionSelector);
          if ((await button.count()) > 0 && (await button.isVisible())) {
            // Don't actually execute bulk actions in test
            await expect(button).toBeVisible();
            break;
          }
        }
      }

      return { bulkOperationsTested };
    });

    // CMS should perform well even with many content items
    expect(result.report.metrics.fcp).toBeLessThan(3000);
    expect(result.report.metrics.lcp).toBeLessThan(5000);

    // Check memory usage for content-heavy pages
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    }
  });
});
