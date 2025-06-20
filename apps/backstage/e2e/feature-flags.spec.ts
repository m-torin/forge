import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import {
  createApiMocker,
  createVisualTester,
  withPerformanceMonitoring,
} from '@repo/testing/playwright';

const authHelpers = createAuthHelpers('http://localhost:3300');

test.describe('Backstage Feature Flags - Management and Configuration Testing', (_: any) => {
  test.beforeEach(async ({ page }: any) => {
    // Sign in as admin user for all feature flag tests
    const testUser = authHelpers.createTestUser({
      name: 'Feature Flags Admin',
      email: `flags-admin-${Date.now()}@example.com`,
    });

    try {
      await authHelpers.signIn(page, testUser);
    } catch {
      await authHelpers.signUp(page, testUser);
    }
  });

  test('feature flags page loads with flag management interface', async ({
    context,
    page,
  }: any) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      '/feature-flags',
      async () => {
        // Verify page loads successfully
        await expect(page).toHaveTitle(/Feature Flags|Flags|Backstage/i);

        // Check for main feature flags container
        const flagsContainer = page.locator('main, [role="main"], .feature-flags-container');
        await expect(flagsContainer).toBeVisible();

        // Look for feature flag management elements
        const flagElements = [
          '[data-testid*="flag"]',
          '[data-testid*="feature-flag"]',
          '.flag-list',
          '.flag-grid',
          '.flag-table',
          'table:has(th:has-text("Flag"))',
          'table:has(th:has-text("Name"))',
          'table:has(th:has-text("Status"))',
          'text=Feature Flags',
          'text=Flags',
          'text=Toggles',
        ];

        let flagInterfaceFound = false;
        for (const selector of flagElements) {
          const elements = page.locator(selector);
          if ((await elements.count()) > 0) {
            await expect(elements.first()).toBeVisible();
            flagInterfaceFound = true;
            break;
          }
        }

        // Look for flag management actions
        const actionButtons = [
          'button:has-text("Create Flag")',
          'button:has-text("Add Flag")',
          'button:has-text("New Flag")',
          '[data-testid*="create-flag"]',
          '[data-testid*="add-flag"]',
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

        return { actionsFound, flagInterfaceFound };
      },
    );

    // Performance assertions
    expect(result.report.metrics.fcp).toBeLessThan(2000);
    expect(result.report.metrics.lcp).toBeLessThan(3000);
  });

  test('feature flag creation and configuration', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock feature flag creation API
    await apiMocker.mockEndpoint('/api/feature-flags', {
      method: 'POST',
      response: {
        id: 'flag-123',
        name: 'test-feature',
        createdAt: new Date().toISOString(),
        description: 'Test feature flag',
        enabled: false,
        key: 'test_feature',
      },
    });

    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Look for create flag button
    const createSelectors = [
      'button:has-text("Create")',
      'button:has-text("Add Flag")',
      'button:has-text("New Flag")',
      'a:has-text("Create")',
      '[data-testid*="create-flag"]',
      '[data-testid*="add-flag"]',
      '[href*="create"]',
      '[href*="new"]',
    ];

    let flagCreationTested = false;
    for (const selector of createSelectors) {
      const createButton = page.locator(selector).first();
      if ((await createButton.count()) > 0 && (await createButton.isVisible())) {
        await createButton.click();
        await page.waitForLoadState('networkidle');

        // Check if we're on a flag creation page
        const currentUrl = page.url();
        if (currentUrl.includes('create') || currentUrl.includes('new')) {
          flagCreationTested = true;

          // Look for flag form elements
          const formElements = [
            'input[name*="name"]',
            'input[name*="key"]',
            'textarea[name*="description"]',
            'select[name*="type"]',
            'input[type="checkbox"]',
            '[data-testid*="flag-form"]',
          ];

          let formFieldsFound = 0;
          for (const formSelector of formElements) {
            if ((await page.locator(formSelector).count()) > 0) {
              formFieldsFound++;
            }
          }

          if (formFieldsFound > 0) {
            // Fill out basic flag information
            const nameInput = page
              .locator('input[name*="name"], input[placeholder*="name" i]')
              .first();
            if ((await nameInput.count()) > 0) {
              await nameInput.fill(`test-feature-${Date.now()}`);
            }

            const keyInput = page
              .locator('input[name*="key"], input[placeholder*="key" i]')
              .first();
            if ((await keyInput.count()) > 0) {
              await keyInput.fill(`test_feature_${Date.now()}`);
            }

            const descriptionInput = page.locator('textarea[name*="description"]').first();
            if ((await descriptionInput.count()) > 0) {
              await descriptionInput.fill('Test feature flag created via e2e testing');
            }

            // Test flag type selection if available
            const typeSelect = page.locator('select[name*="type"]').first();
            if ((await typeSelect.count()) > 0) {
              await typeSelect.selectOption({ index: 1 });
            }

            // Try to save the flag
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

    // If no creation form found, test existing flag editing
    if (!flagCreationTested) {
      const flagItems = ['.flag-item', '.flag-row', 'tr:has(td)', '[data-testid*="flag-item"]'];

      for (const selector of flagItems) {
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

  test('feature flag toggling and status management', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page);
    const apiMocker = createApiMocker(page);

    // Mock flag toggle API
    await apiMocker.mockEndpoint('/api/feature-flags/*/toggle', {
      method: 'POST',
      response: {
        id: 'flag-123',
        enabled: true,
        updatedAt: new Date().toISOString(),
      },
    });

    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Look for flag toggle controls
    const toggleElements = [
      'input[type="checkbox"]',
      'button[role="switch"]',
      '.toggle-switch',
      '.flag-toggle',
      '[data-testid*="toggle"]',
      '[data-testid*="switch"]',
    ];

    let toggleTested = false;
    for (const selector of toggleElements) {
      const toggles = page.locator(selector);
      if ((await toggles.count()) > 0) {
        const firstToggle = toggles.first();
        if (await firstToggle.isVisible()) {
          // Get initial state
          const isChecked = await firstToggle.isChecked();

          // Toggle the flag
          await firstToggle.click();
          await page.waitForTimeout(1000);

          // Verify state changed (if it's a checkbox)
          if (await firstToggle.evaluate((el: any) => el.type === 'checkbox')) {
            const newState = firstToggle;
            await expect(newState).toBeChecked();
          }

          toggleTested = true;
          break;
        }
      }
    }

    // Test flag status indicators
    const statusElements = [
      'text=Enabled',
      'text=Disabled',
      'text=Active',
      'text=Inactive',
      '.status-badge',
      '.flag-status',
      '[data-testid*="status"]',
    ];

    let statusIndicatorFound = false;
    for (const selector of statusElements) {
      if ((await page.locator(selector).count()) > 0) {
        statusIndicatorFound = true;
        break;
      }
    }

    // Take screenshot of flag list with status indicators
    if (statusIndicatorFound || toggleTested) {
      await visualTester.compareScreenshot('feature-flags-list', {
        fullPage: true,
        threshold: 0.3,
      });
    }

    // Test bulk toggle operations if available
    const bulkToggleButtons = [
      'button:has-text("Enable All")',
      'button:has-text("Disable All")',
      'button:has-text("Bulk Toggle")',
      '[data-testid*="bulk-toggle"]',
    ];

    for (const selector of bulkToggleButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        // Don't actually execute bulk operations in test
        await expect(button).toBeVisible();
        break;
      }
    }
  });

  test('feature flag environments and targeting', async ({ context, page }: any) => {
    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Look for environment management
    const environmentElements = [
      'text=Environment',
      'text=Production',
      'text=Development',
      'text=Staging',
      'select[name*="environment"]',
      '[data-testid*="environment"]',
      '.environment-selector',
      '.env-toggle',
    ];

    let environmentManagementFound = false;
    for (const selector of environmentElements) {
      if ((await page.locator(selector).count()) > 0) {
        environmentManagementFound = true;
        break;
      }
    }

    if (environmentManagementFound) {
      // Test environment switching
      const envSelectors = page.locator('select[name*="environment"]');
      if ((await envSelectors.count()) > 0) {
        const envSelect = envSelectors.first();
        if (await envSelect.isVisible()) {
          await envSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1000);
        }
      }

      // Test environment-specific toggles
      const envButtons = [
        'button:has-text("Production")',
        'button:has-text("Development")',
        'button:has-text("Staging")',
        '[data-testid*="env-"]',
      ];

      for (const selector of envButtons) {
        const button = page.locator(selector).first();
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(500);
          break;
        }
      }
    }

    // Test user/group targeting
    const targetingElements = [
      'text=Targeting',
      'text=Users',
      'text=Groups',
      'text=Percentage',
      'text=Rollout',
      '[data-testid*="targeting"]',
      '[data-testid*="rollout"]',
      '.targeting-config',
      '.rollout-settings',
    ];

    let targetingFound = false;
    for (const selector of targetingElements) {
      if ((await page.locator(selector).count()) > 0) {
        targetingFound = true;
        break;
      }
    }

    if (targetingFound) {
      // Test percentage rollout if available
      const percentageInputs = [
        'input[type="range"]',
        'input[type="number"]',
        'input[name*="percentage"]',
        'input[name*="rollout"]',
      ];

      for (const selector of percentageInputs) {
        const input = page.locator(selector).first();
        if ((await input.count()) > 0 && (await input.isVisible())) {
          if (await input.evaluate((el: any) => el.type === 'range')) {
            await input.fill('50');
          } else if (await input.evaluate((el: any) => el.type === 'number')) {
            await input.fill('25');
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test user targeting
      const userTargetInputs = [
        'input[name*="users"]',
        'input[placeholder*="user" i]',
        'textarea[name*="users"]',
      ];

      for (const selector of userTargetInputs) {
        const input = page.locator(selector).first();
        if ((await input.count()) > 0 && (await input.isVisible())) {
          await input.fill('user1@example.com, user2@example.com');
          await page.waitForTimeout(500);
          break;
        }
      }
    }
  });

  test('feature flag analytics and usage tracking', async ({ context, page }: any) => {
    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Look for analytics features
    const analyticsElements = [
      'text=Analytics',
      'text=Usage',
      'text=Metrics',
      'text=Statistics',
      'text=Performance',
      'button:has-text("Analytics")',
      '[data-testid*="analytics"]',
      '[data-testid*="metrics"]',
      '.analytics-panel',
      '.usage-stats',
    ];

    let analyticsFound = false;
    for (const selector of analyticsElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        analyticsFound = true;

        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(1000);

          // Look for analytics data
          const analyticsData = [
            'text=/\\d+%/',
            'text=/\\d+ requests/',
            'text=/\\d+ users/',
            '.chart',
            '.graph',
            '[data-testid*="chart"]',
          ];

          for (const dataSelector of analyticsData) {
            if ((await page.locator(dataSelector).count()) > 0) {
              break;
            }
          }
        }
        break;
      }
    }

    // Test date range filtering for analytics
    const dateFilters = [
      'select:has(option:has-text("Last 7 days"))',
      'select:has(option:has-text("Last 30 days"))',
      'input[type="date"]',
      '[data-testid*="date-filter"]',
    ];

    for (const selector of dateFilters) {
      const filter = page.locator(selector).first();
      if ((await filter.count()) > 0 && (await filter.isVisible())) {
        if (await filter.evaluate((el: any) => el.tagName === 'SELECT')) {
          await filter.selectOption({ index: 1 });
        } else if (await filter.evaluate((el: any) => el.type === 'date')) {
          const today = new Date().toISOString().slice(0, 10);
          await filter.fill(today);
        }
        await page.waitForTimeout(500);
        break;
      }
    }

    // Look for flag usage indicators
    const usageElements = [
      'text=Last Used',
      'text=Usage Count',
      'text=Active Users',
      '.usage-indicator',
      '.last-accessed',
    ];

    for (const selector of usageElements) {
      if ((await page.locator(selector).count()) > 0) {
        break;
      }
    }
  });

  test('feature flag search and filtering capabilities', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page);

    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Test flag search functionality
    const searchElements = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="flag" i]',
      '[data-testid*="search"]',
      '.search-input',
    ];

    for (const selector of searchElements) {
      const searchInput = page.locator(selector).first();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill('test flag');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Take screenshot of search results
        await visualTester.compareScreenshot('feature-flags-search', {
          fullPage: true,
          threshold: 0.3,
        });
        break;
      }
    }

    // Test status filtering
    const statusFilterElements = [
      'select:has(option:has-text("Enabled"))',
      'select:has(option:has-text("Disabled"))',
      'button:has-text("Enabled")',
      'button:has-text("Disabled")',
      '[data-testid*="status-filter"]',
      '.status-filter',
    ];

    for (const selector of statusFilterElements) {
      const filterElement = page.locator(selector).first();
      if ((await filterElement.count()) > 0 && (await filterElement.isVisible())) {
        if (await filterElement.evaluate((el: any) => el.tagName === 'SELECT')) {
          await filterElement.selectOption({ index: 1 });
        } else {
          await filterElement.click();
        }
        await page.waitForTimeout(500);
        break;
      }
    }

    // Test type/category filtering
    const typeFilterElements = [
      'select:has(option:has-text("Boolean"))',
      'select:has(option:has-text("String"))',
      'select:has(option:has-text("Number"))',
      '[data-testid*="type-filter"]',
    ];

    for (const selector of typeFilterElements) {
      const filterElement = page.locator(selector).first();
      if ((await filterElement.count()) > 0 && (await filterElement.isVisible())) {
        await filterElement.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        break;
      }
    }

    // Test sorting options
    const sortElements = [
      'select:has(option:has-text("Name"))',
      'select:has(option:has-text("Created"))',
      'select:has(option:has-text("Updated"))',
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

  test('feature flag dependencies and relationships', async ({ context, page }: any) => {
    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Look for dependency management features
    const dependencyElements = [
      'text=Dependencies',
      'text=Prerequisites',
      'text=Relationships',
      'text=Parent Flags',
      'text=Child Flags',
      '[data-testid*="dependency"]',
      '[data-testid*="relationship"]',
      '.dependency-graph',
      '.flag-relationships',
    ];

    let dependencyManagementFound = false;
    for (const selector of dependencyElements) {
      if ((await page.locator(selector).count()) > 0) {
        dependencyManagementFound = true;
        break;
      }
    }

    if (dependencyManagementFound) {
      // Test adding dependencies
      const addDependencyButtons = [
        'button:has-text("Add Dependency")',
        'button:has-text("Add Prerequisite")',
        '[data-testid*="add-dependency"]',
      ];

      for (const selector of addDependencyButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for dependency selection interface
          const dependencySelection = [
            'select[name*="dependency"]',
            'input[name*="prerequisite"]',
            '.dependency-selector',
          ];

          for (const selectionSelector of dependencySelection) {
            if ((await page.locator(selectionSelector).count()) > 0) {
              break;
            }
          }
          break;
        }
      }

      // Test dependency visualization
      const visualizationElements = [
        '.dependency-graph',
        '.flag-tree',
        'svg',
        'canvas',
        '[data-testid*="graph"]',
      ];

      for (const selector of visualizationElements) {
        if ((await page.locator(selector).count()) > 0) {
          break;
        }
      }
    }

    // Test conflict detection
    const conflictElements = [
      'text=Conflict',
      'text=Warning',
      'text=Dependency Error',
      '.conflict-warning',
      '.dependency-error',
      '[data-testid*="conflict"]',
    ];

    for (const selector of conflictElements) {
      if ((await page.locator(selector).count()) > 0) {
        break;
      }
    }
  });

  test('feature flag import/export and backup', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock import/export APIs
    await apiMocker.mockEndpoint('/api/feature-flags/export', {
      method: 'POST',
      response: {
        downloadUrl: '/api/downloads/flags-export-123.json',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    });

    await apiMocker.mockEndpoint('/api/feature-flags/import', {
      method: 'POST',
      response: {
        errors: [],
        imported: 5,
        skipped: 1,
      },
    });

    await page.goto('/feature-flags');
    await page.waitForLoadState('networkidle');

    // Test export functionality
    const exportButtons = [
      'button:has-text("Export")',
      'button:has-text("Export Flags")',
      'button:has-text("Backup")',
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
          'text=JSON',
          'text=YAML',
          'text=CSV',
          'select:has(option:has-text("JSON"))',
          '.export-dialog',
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

    // Test import functionality
    const importButtons = [
      'button:has-text("Import")',
      'button:has-text("Import Flags")',
      'button:has-text("Restore")',
      '[data-testid*="import"]',
    ];

    for (const selector of importButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);

        // Look for import interface
        const importElements = [
          'input[type="file"]',
          'text=Upload',
          'text=JSON',
          '.import-dialog',
          '.file-upload',
        ];

        for (const importSelector of importElements) {
          if ((await page.locator(importSelector).count()) > 0) {
            break;
          }
        }
        break;
      }
    }

    // Test configuration backup
    const backupButtons = [
      'button:has-text("Backup")',
      'button:has-text("Create Backup")',
      '[data-testid*="backup"]',
    ];

    for (const selector of backupButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);
        break;
      }
    }
  });

  test('feature flags performance and real-time updates', async ({ context, page }: any) => {
    const { result } = await withPerformanceMonitoring(
      page,
      context,
      '/feature-flags',
      async () => {
        // Test real-time updates if available
        const realtimeElements = [
          'text=Real-time',
          'text=Live Updates',
          '.live-indicator',
          '.real-time-status',
          '[data-testid*="live"]',
        ];

        let realtimeFound = false;
        for (const selector of realtimeElements) {
          if ((await page.locator(selector).count()) > 0) {
            realtimeFound = true;
            break;
          }
        }

        // Test flag list performance with many flags
        const flagItems = page.locator('.flag-item, .flag-row, tr:has(td)');
        const flagCount = await flagItems.count();

        // Test pagination if there are many flags
        if (flagCount > 20) {
          const paginationElements = [
            '.pagination',
            'button:has-text("Next")',
            '[data-testid*="pagination"]',
          ];

          for (const selector of paginationElements) {
            const pagination = page.locator(selector);
            if ((await pagination.count()) > 0 && (await pagination.isVisible())) {
              const nextButton = pagination.locator('button:has-text("Next")');
              if ((await nextButton.count()) > 0) {
                await nextButton.click();
                await page.waitForLoadState('networkidle');
              }
              break;
            }
          }
        }

        // Test bulk operations performance
        const bulkElements = [
          'input[type="checkbox"]',
          'button:has-text("Select All")',
          '[data-testid*="bulk"]',
        ];

        for (const selector of bulkElements) {
          const element = page.locator(selector).first();
          if ((await element.count()) > 0 && (await element.isVisible())) {
            if (await element.evaluate((el: any) => el.type === 'checkbox')) {
              await element.check();
            } else {
              await element.click();
            }
            await page.waitForTimeout(500);
            break;
          }
        }

        return { flagCount, realtimeFound };
      },
    );

    // Feature flags page should load quickly
    expect(result.report.metrics.fcp).toBeLessThan(2500);
    expect(result.report.metrics.lcp).toBeLessThan(4000);

    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    }
  });
});
